import { t } from "../t";
import { ensureLoggedInProcedure } from "../middleware";
import fs from "fs";
import { NORMALIZED_ROOT_PATH, ROOT_DATA_PATH, readFolder } from "../services/files";
import path from "path";
import { z } from "zod";
import prisma from "../prisma";
import { log } from "../services/logger";
import type { Restriction } from "@prisma/client";
import { PERMISSIONS } from "$lib/utils/permissions";

interface Directory {
  fullPath: string;
  name: string;
  children: Directory[];
  selected?: boolean;
}

const RestrictionsController = t.router({
  peekInsideFolder: ensureLoggedInProcedure
    .input(z.object({ rootPath: z.string() }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return null;
      }

      try {
        const rootRestriction = await prisma.restriction.findFirst({
          where: { rootPath: '/' },
        });

        if (rootRestriction) {
          return readFolder(rootRestriction.id, req.input.rootPath, req.ctx.user, 10);
        }
      } catch (e) {
        log('ERROR', `PeekInsideFolder: ${JSON.stringify(e)}`, req.ctx.user);
      }
      return null;
    }),

  applyRestrictions: ensureLoggedInProcedure
    .input(z.object({ userId: z.number(), restrictions: z.array(z.string()) }))
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return null;
      }

      try {
        const possiblyBecamePublicRestrictions: string[] = [];

        await prisma.$transaction(async (tx) => {
          const userRestrictions = await tx.userRestriction.findMany({
            where: {
              userId: req.input.userId,
            },
            include: {
              restriction: true,
            }
          });

          // Remove all restrictions that are not in the new list
          for (const userRestriction of userRestrictions) {
            const toRemoveRestriction = req.input.restrictions.find((rootPath) => rootPath === userRestriction.restriction.rootPath);

            if (!toRemoveRestriction) {
              await tx.userRestriction.deleteMany({
                where: {
                  userId: req.input.userId,
                  restrictionId: userRestriction.restrictionId,
                }
              })
              possiblyBecamePublicRestrictions.push(userRestriction.restriction.id);
            }
          }

          const selectedRestrictions: Record<string, Restriction> = {};
          userRestrictions?.forEach(({ restriction }) => {
            selectedRestrictions[restriction.rootPath] = restriction;
          });

          // Add all restrictions that are not in the old list
          for (const restrictionRootPath of req.input.restrictions) {
            if (selectedRestrictions[restrictionRootPath]) {
              continue;
            }

            const maybeExistingRestriction = await tx.restriction.findFirst({
              where: { rootPath: restrictionRootPath }
            })

            if (maybeExistingRestriction) {
              await tx.userRestriction.create({
                data: {
                  userId: req.input.userId,
                  restrictionId: maybeExistingRestriction.id,
                }
              });
            } else {
              await tx.restriction.create({
                data: {
                  rootPath: restrictionRootPath,
                  name: path.basename(restrictionRootPath),
                  permissions: PERMISSIONS.READ,
                  userRestrictions: {
                    create: {
                      userId: req.input.userId,
                    }
                  }
                }
              });
            }
          }
        });

        // If a restriction became public, we need to remove it
        await prisma.$transaction(async (tx) => {
          for (const restrictionId of possiblyBecamePublicRestrictions) {
            const userRestrictionsCount = await tx.userRestriction.count({
              where: { restrictionId }
            })
            if (userRestrictionsCount === 0) {
              await tx.restrictionModifier.deleteMany({
                where: { restrictionId }
              })
              await tx.restriction.delete({
                where: { id: restrictionId }
              })
            }
          }
        })
      } catch (e) {
        log('ERROR', `Admin:ApplyRestrictions: ${JSON.stringify(e)}`, req.ctx.user);
      }

      return null;
    }),

  listDirectoryTree: ensureLoggedInProcedure
    .input(z.object({ userId: z.number() }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return null;
      }

      try {
        const userRestrictions = await prisma.userRestriction.findMany({
          where: {
            userId: req.input.userId,
          },
          include: {
            restriction: true,
          }
        });

        const selectedRestrictions: Record<string, boolean> = {};
        userRestrictions?.forEach(({ restriction }) => {
          selectedRestrictions[restriction.rootPath] = true;
        });

        return parseDirectory(ROOT_DATA_PATH, selectedRestrictions);
      } catch (e) {
        log('ERROR', `ListDirectoryTree: ${JSON.stringify(e)}`, req.ctx.user);
      }

      return null;
    })
})

function parseDirectory(dir: string, selectedRestrictions: Record<string, boolean>): Directory {
  const files = fs.readdirSync(dir);

  const directories = files.filter((file) => {
    const stats = fs.statSync(`${dir}/${file}`);
    return stats.isDirectory();
  });

  const children = directories.map((directory: string) => {
    return parseDirectory(path.join(dir, directory), selectedRestrictions);
  }).sort((a, b) => {
    return b.name.localeCompare(a.name);
  });

  const fullPath = path.normalize(dir).replace(NORMALIZED_ROOT_PATH, '') || '/';
  return {
    fullPath,
    name: path.basename(dir) === NORMALIZED_ROOT_PATH ? 'Root' : path.basename(dir),
    selected: selectedRestrictions[fullPath],
    children,
  };
}

export default RestrictionsController;
