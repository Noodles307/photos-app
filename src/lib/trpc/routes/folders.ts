import { PERMISSIONS, has } from "$lib/utils/permissions";
import mime from "mime-types";
import fs from 'fs';
import { z } from "zod";
import { ensureLoggedInProcedure } from "../middleware";
import prisma from "../prisma";
import { getResourceFrom, readFolder } from "../services/files";
import path from "path";
import { t } from "../t";
import type { Restriction, User } from "@prisma/client";
import { log } from "../services/logger";
import { createFolderRestriction, editFolderRestriction } from "./schemas";
import { sanitizeFolderName } from "$lib/utils/string";
import { logExecutionTime } from "../services/metrics";

const FoldersController = t.router({
  getFolders: ensureLoggedInProcedure
    .query(async (req) => {
      try {
        const privateRestrictions = await prisma.restriction.findMany({
          where: {
            userRestrictions: { some: { userId: req.ctx.user.id } },
            permissions: { not: 0 }
          },
        })
        const publicRestrictions = await prisma.restriction.findMany({
          where: {
            userRestrictions: { none: {} },
            permissions: { not: 0 }
          },
        })

        if (!publicRestrictions || !privateRestrictions) {
          return { folders: [] }
        }

        const folders = publicRestrictions.map((restriction) => ({
          id: restriction.id,
          rootPath: restriction.rootPath,
          name: restriction.name,

          canRead: has(restriction.permissions, PERMISSIONS.READ),
          canWrite: has(restriction.permissions, PERMISSIONS.WRITE),
          canDelete: has(restriction.permissions, PERMISSIONS.DELETE),
          canEdit: has(restriction.permissions, PERMISSIONS.EDIT),
          public: true,
        }));

        const privateFolders = privateRestrictions.map((restriction) => ({
          id: restriction.id,
          rootPath: restriction.rootPath,

          canRead: has(restriction.permissions, PERMISSIONS.READ),
          canWrite: has(restriction.permissions, PERMISSIONS.WRITE),
          canDelete: has(restriction.permissions, PERMISSIONS.DELETE),
          canEdit: has(restriction.permissions, PERMISSIONS.EDIT),
          public: false,
        }));

        return {
          folders: [...folders, ...privateFolders].sort((a, b) => b.rootPath.localeCompare(a.rootPath)),
        };
      } catch (e) {
        return { folders: [] }
      }
    }),

  createFolder: ensureLoggedInProcedure
    .input(z.object({
      path: z.string(),
      restrictionID: z.string().uuid(),
      name: z.string().min(1).max(150),
    }))
    .mutation(async (req) => {
      const resource = await getResourceFrom(req.input.restrictionID, req.input.path, req.ctx.user);

      if (!resource || !has(resource.permissions, PERMISSIONS.WRITE)) {
        return null;
      }

      const name = sanitizeFolderName(req.input.name);

      const fullPath = path.join(resource.fullPathOnDisk, name);
      const cacheFullPath = path.join(resource.cacheFullPathOnDisk, name);

      try {
        fs.mkdirSync(fullPath);
        fs.mkdirSync(cacheFullPath);
      } catch (e) {
        console.log(e);
        return null;
      }

      return 'success';
    }),

  deleteFiles: t.procedure
    .input(z.object({
      restrictionID: z.string().uuid(), path: z.string(),
      files: z.array(z.string()).min(1),
    }))
    .mutation(async (req) => {
      const resource = await getResourceFrom(req.input.restrictionID, req.input.path, req.ctx.user as User | null);

      if (!resource || !has(resource.permissions, PERMISSIONS.DELETE)) {
        return null;
      }

      console.log('deleteFiles', req.input.files)

      req.input.files.forEach((name) => {
        const normalizedName = path.normalize(name.replace(/\.\.\//g, ''));
        const pathToFile = path.join(resource.fullPathOnDisk, normalizedName);
        if (!fs.existsSync(pathToFile)) {
          return;
        }

        if (fs.statSync(pathToFile).isDirectory()) {
          fs.rmdirSync(pathToFile, { recursive: true });
        } else {
          fs.unlinkSync(pathToFile);
        }
      });
    }),

  readFolder: t.procedure
    .input(z.object({ restrictionID: z.string().uuid(), path: z.string() }))
    .query(async (req) => {
      return await readFolder(req.input.restrictionID, req.input.path, req.ctx.user);
    }),

  getFolderRestrictionByPath: ensureLoggedInProcedure
    .input(z.object({
      restrictionID: z.string().uuid(), path: z.string(),
      folderName: z.string()
    }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return null;
      }

      try {
        const rootRestriction = await prisma.restriction.findFirst({
          where: { id: req.input.restrictionID },
        });

        if (!rootRestriction) {
          return null;
        }

        const normalizedInputPath = path.normalize(req.input.folderName.replace(/\.\.\//g, ''));
        const normalizedPath = path.normalize(req.input.path.replace(/\.\.\//g, ''));
        const resourcePath = path.join(rootRestriction.rootPath, normalizedPath, normalizedInputPath);

        const foundMatchingRestrictions = await prisma.$queryRawUnsafe<Restriction[] | null>(`
          SELECT r.*
          FROM "Restriction" r
          LEFT JOIN "UserRestriction" ur ON ur."restrictionId" = r."id"
          WHERE "rootPath" = $1
      `, resourcePath);

        if (!foundMatchingRestrictions || foundMatchingRestrictions.length === 0) {
          return null;
        }

        const restriction = foundMatchingRestrictions[0];

        const userRestrictions = await prisma.userRestriction.findMany({
          where: { restrictionId: restriction.id },
          include: { user: true }
        });

        const restrictionModifier = await prisma.restrictionModifier.findFirst({
          where: { restrictionId: restriction.id },
        })

        return {
          id: restriction.id,
          rootPath: restriction.rootPath,
          name: restriction.name,
          uri: `/folder/${restriction.id}`,

          sharedWith: userRestrictions.map((ur) => ({
            name: ur.user.name || ur.user.email,
            value: ur.user.id.toString(),
          })),

          canRead: has(restriction.permissions, PERMISSIONS.READ),
          canWrite: has(restriction.permissions, PERMISSIONS.WRITE),
          canDelete: has(restriction.permissions, PERMISSIONS.DELETE),
          canEdit: has(restriction.permissions, PERMISSIONS.EDIT),

          afterDate: restrictionModifier?.modifyDate,
          modifierCanEdit: has(restrictionModifier?.newPermissions, PERMISSIONS.EDIT),
          modifierCanDelete: has(restrictionModifier?.newPermissions, PERMISSIONS.DELETE),
          modifierCanRead: has(restrictionModifier?.newPermissions, PERMISSIONS.READ),
          modifierCanWrite: has(restrictionModifier?.newPermissions, PERMISSIONS.WRITE),
        }
      } catch (e) {
        return null;
      }
    }),

  editFolderRestriction: ensureLoggedInProcedure
    .input(editFolderRestriction)
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return { error: 'You are not allowed to do this', shareURL: null };
      }

      try {
        const rootRestriction = await prisma.restriction.findFirst({
          where: { id: req.input.restrictionID },
        });

        if (!rootRestriction) {
          return null;
        }

        await prisma.$transaction([
          prisma.userRestriction.deleteMany({
            where: { restrictionId: rootRestriction.id },
          }),

          prisma.restrictionModifier.deleteMany({
            where: { restrictionId: rootRestriction.id },
          }),

          prisma.restriction.update({
            where: { id: rootRestriction.id },
            data: {
              permissions: createPermission({ ...req.input }),

              userRestrictions: {
                create: req.input.shareWith?.map((user) => ({
                  userId: parseInt(user.value, 10),
                })) || [],
              },

              restrictionModifier: req.input.afterDate ? {
                create: {
                  modifyDate: req.input.afterDate && new Date(req.input.afterDate),
                  newPermissions: createPermission({
                    canRead: req.input.modifierCanRead,
                    canWrite: req.input.modifierCanWrite,
                    canDelete: req.input.modifierCanDelete,
                    canEdit: req.input.modifierCanEdit,
                  }),
                }
              } : undefined,
            }
          })
        ]);

        return 'success';

      } catch (e) {
        log("ERROR", `Error trying to edit restriction: ${JSON.stringify(e)} : ${JSON.stringify(req.input)}`, req.ctx.user);
        return null;
      }
    }),

  createFolderRestriction: ensureLoggedInProcedure
    .input(createFolderRestriction)
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return { error: 'You are not allowed to do this', shareURL: null };
      }

      try {
        const resource = await getResourceFrom(req.input.restrictionID, req.input.path, req.ctx.user);

        if (!resource || !has(resource.permissions, PERMISSIONS.READ)) {
          return { error: 'You are not allowed to do this', shareURL: null };
        }

        const normalizedInputPath =
          path.normalize(
            req.input.folderName
              .replace(/\.\.\//g, '')
              .replace('&', '-')
          );

        const restrictionFullRootPath = path.join(resource.resourcePath, normalizedInputPath);

        const newRestriction = await prisma.restriction.create({
          data: {
            name: req.input.folderName,
            rootPath: restrictionFullRootPath,
            permissions: createPermission({ ...req.input }),

            restrictionModifier: req.input.afterDate ? {
              create: {
                modifyDate: req.input.afterDate && new Date(req.input.afterDate),
                newPermissions: createPermission({
                  canRead: req.input.modifierCanRead,
                  canWrite: req.input.modifierCanWrite,
                  canDelete: req.input.modifierCanDelete,
                  canEdit: req.input.modifierCanEdit,
                }),
              }
            } : undefined,

            userRestrictions: {
              create: req.input.shareWith?.map((user) => ({
                userId: parseInt(user.value, 10),
              })) || [],
            }
          }
        });

        if (!newRestriction) {
          return { error: 'Could not create folder', shareURL: null };
        }

        return { error: null, shareURL: `/folder/${newRestriction.id}` };
      } catch (e) {
        log("ERROR", `Error trying to share folder: ${JSON.stringify(e)}`, req.ctx.user);
        return null;
      }
    }),

});

function createPermission(input: { canRead?: boolean, canWrite?: boolean, canDelete?: boolean, canEdit?: boolean }): number {
  let permissions = 0;

  if (input.canRead) {
    permissions |= PERMISSIONS.READ;
  }

  if (input.canWrite) {
    permissions |= PERMISSIONS.WRITE;
  }

  if (input.canDelete) {
    permissions |= PERMISSIONS.DELETE;
  }

  if (input.canEdit) {
    permissions |= PERMISSIONS.EDIT;
  }

  return permissions;
}

export default FoldersController;
