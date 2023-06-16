import mime from "mime-types";
import path from "path";
import fs from 'fs';
import take from "lodash/take";
import sharp from 'sharp';
import { log } from "./logger";
import type { Restriction, User } from "@prisma/client";
import prisma from "../prisma";
import { PERMISSIONS, has } from "$lib/utils/permissions";
import { logExecutionTime } from "./metrics";

export const ROOT_DATA_PATH = './data';
export const THUMBNAIL_ROOT_DATA_PATH = './cache';

export const PATH_TO_ROOT_DIR = process.env.PWD || '';
console.log('PATH_TO_ROOT_DIR', PATH_TO_ROOT_DIR)

export const NORMALIZED_ROOT_PATH = path.normalize(ROOT_DATA_PATH)
export const CACHE_ABSOLUTE_DISK_PATH = path.join(NORMALIZED_ROOT_PATH, THUMBNAIL_ROOT_DATA_PATH);



// NOTE: This is a helper function that will return a resource if the user has access to it
// A bit of a complex and ugly function, but it works for now
export async function getResourceFrom(restrictionID: string, folderPath: string, user: User | null) {
  // Note: If I'm logged in and the folder is public, I should be able to access it
  // we make 2 queries, one for private restrictions and one for public restrictions
  const [privateRestriction, publicRestriction] = await Promise.all([
    prisma.restriction.findFirst({
      where: {
        id: restrictionID,
        userRestrictions: user
          ? { some: { userId: user?.id } }
          : { none: {} },
      },
    }),
    prisma.restriction.findFirst({
      where: {
        id: restrictionID,
        userRestrictions: { none: {} },
      },
    }),
  ]);

  /*
  console.log('restrictionID', restrictionID)
  console.log('path', folderPath)
  console.log('user', user)
  */

  const restriction = privateRestriction || publicRestriction;

  if (!restriction || restriction.permissions === 0) {
    return null;
  }


  const normalizedInputPath = path.normalize(folderPath.replace(/\.\.\//g, ''));
  const resourcePath = path.join(restriction.rootPath, normalizedInputPath);

  // NOTE: If the sure is logged in,
  // we should check if the user has a restriction on the parent folder
  const privateParentRestrictions = user
    ? await prisma.$queryRawUnsafe<Restriction[] | null>(`
            SELECT r.*
            FROM "Restriction" r
            LEFT JOIN "UserRestriction" ur ON ur."restrictionId" = r."id"
            WHERE position("rootPath" in $1) = 1 AND ur."userId" = ${user.id};
          `, resourcePath)
    : null;

  // NOTE: There may be some parent public restrictions with more permissions
  const publicParentRestrictions = await prisma.$queryRawUnsafe<Restriction[] | null>(`
        SELECT r.* 
        FROM "Restriction" r
        left join "UserRestriction" ur on ur."restrictionId"=r.id
        WHERE position("rootPath" in $1) = 1 and ur."userId" is NULL
      `, resourcePath);

  const allParentRestrictions = [
    ...(privateParentRestrictions || []),
    ...(publicParentRestrictions || []),
    restriction,
  ]

  const permissions = allParentRestrictions.reduce((acc, cur) => acc | cur.permissions, 0);

  if (!has(permissions, PERMISSIONS.READ)) {
    return null;
  }

  return {
    permissions,
    // This is the normalized path, so it can be used in the URI
    // Does not include the ROOT_DATA_PATH neither restriction.rootPath
    normalizedPath: normalizedInputPath,
    restrictionName: restriction.name,
    resourcePath,
    fullPathOnDisk: path.join(PATH_TO_ROOT_DIR, ROOT_DATA_PATH, resourcePath),
    cacheFullPathOnDisk: path.join(PATH_TO_ROOT_DIR, THUMBNAIL_ROOT_DATA_PATH, resourcePath),
  }
}

export async function generateThumbnails(root = ROOT_DATA_PATH) {
  const files = fs.readdirSync(root);

  files.forEach((file) => {
    const filePath = path.join(root, file);
    const thumbnailPath = filePath
      .replace(NORMALIZED_ROOT_PATH, THUMBNAIL_ROOT_DATA_PATH)
      .replace(path.extname(filePath), '.webp');

    const stat = fs.statSync(filePath);

    const isDirectory = stat.isDirectory();
    if (isDirectory) {
      generateThumbnails(filePath);
      return;
    }

    const mimeType = mime.lookup(file) || '';
    if (!mimeType.startsWith('image')) {
      return;
    }

    if (fs.existsSync(thumbnailPath)) {
      return;
    }

    fs.mkdirSync(thumbnailPath.replace(path.basename(thumbnailPath), ''), { recursive: true });

    sharp(filePath)
      .resize(100, 100)
      .webp()
      .toFile(thumbnailPath, (err) => {
        if (err) {
          log('ERROR', `Failed to generate thumbnail for ${filePath} at path ${thumbnailPath}:: ${err}`);
        } else {
          log('DEBUG', `Generated thumbnail for ${filePath} at path ${thumbnailPath}`);
        }
      })
  });
}

export async function readFolder(restrictionID: string, inputPath: string, currentUser: User | null, takeCount?: number) {
  const resource = await getResourceFrom(restrictionID, inputPath, currentUser);

  if (!resource || !has(resource.permissions, PERMISSIONS.READ)) {
    return null;
  }

  const before = Date.now();

  try {

    const files = fs.readdirSync(resource.fullPathOnDisk)

    const videoPaths: string[] = [];

    const mappedFiles = take(files.map((file) => {
      const thumbnailFile = file.replace(path.extname(file), '.webp');
      const fullPath = path.normalize(path.join(resource.fullPathOnDisk, file));
      const stats = fs.statSync(fullPath);

      const mimeType = mime.lookup(file) || '' as string;

      if (mimeType.startsWith('video')) {
        videoPaths.push(fullPath);
      }

      return {
        name: file,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        mimeType,
        lastModified: stats.mtime.getTime(),
        videoIframeUri: '',
        thumbnailUri: stats.isDirectory()
          ? null
          : `/thumbnail/${restrictionID}?path=${path.join(resource.normalizedPath, thumbnailFile)}`,
        uri: stats.isDirectory()
          ? `/folder/${restrictionID}?path=${path.join(resource.normalizedPath, file)}`
          : `/file/${restrictionID}?path=${path.join(resource.normalizedPath, file)}`,
      }
    }).sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.uri.localeCompare(b.uri);
    }), takeCount || files.length);

    if (videoPaths.length > 0) {
      (await Promise.all(videoPaths.map(async (video) => {
        return prisma.video.findFirst({ where: { fullPath: video } })
      }))).forEach((video) => {
        if (!video || video.status !== 'UPLOADED') return;
        const index = mappedFiles.findIndex((file) => file.name === video.name);
        if (index === -1) return;

        mappedFiles[index].videoIframeUri = `https://iframe.mediadelivery.net/embed/128752/${video.cdnKey}?preload=false`;
      });
    }

    const durationMs = Date.now() - before;
    logExecutionTime(durationMs, '/folder');

    return {
      test: true,
      files: mappedFiles,
      name: resource.restrictionName,

      canRead: has(resource.permissions, PERMISSIONS.READ),
      canWrite: has(resource.permissions, PERMISSIONS.WRITE),
      canDelete: has(resource.permissions, PERMISSIONS.DELETE),
      canEdit: has(resource.permissions, PERMISSIONS.EDIT),
    };
  } catch (e) {
    log("ERROR", `Failed to read folder ${inputPath} for restriction ${restrictionID}. ${path.join(resource.fullPathOnDisk)}`, currentUser);
    return null;
  }
}
