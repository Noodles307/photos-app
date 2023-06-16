import { getResourceFrom } from "$lib/trpc/services/files";
import { log } from "$lib/trpc/services/logger";
import archiver from 'archiver';
import { getUserFromCookie } from "$lib/utils/cookies";
import { PERMISSIONS, has } from "$lib/utils/permissions";
import type { RequestHandler } from "./$types";
import fs from 'fs';
import pathUtils from 'path';

export const GET: RequestHandler = async (req) => {
  const restrictionID = req.url.searchParams.get('restrictionID') || '';
  const path = req.url.searchParams.get('path') || '';

  const rowFilesParams = req.url.searchParams.get('files') || '';
  const filesToDownload = ([] as string[]).concat(rowFilesParams.split(',') || [])

  if (!restrictionID || filesToDownload.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  const loggedInUser = await getUserFromCookie(req.cookies.get('authorization') || '');

  log('INFO', `
      Download files ${filesToDownload.join(',')}
      path=${path},
      restrictionID=${restrictionID}
  `, loggedInUser);

  const resource = await getResourceFrom(restrictionID, path, loggedInUser);

  if (!resource || !has(resource.permissions, PERMISSIONS.READ)) {
    return new Response('Not found', { status: 404 });
  }

  const archive = archiver('zip', { store: true });

  // @ts-ignore
  const res = new Response(archive, { status: 200 });
  res.headers.set('Content-Type', 'application/zip');
  res.headers.set('Content-Disposition', 'attachment; filename=download.zip');

  filesToDownload.forEach((name: string) => {
    const normalizedName = pathUtils.normalize(name.replace(/\.\.\//g, ''));
    const pathToFile = pathUtils.join(resource.fullPathOnDisk, normalizedName);

    if (!fs.existsSync(pathToFile)) {
      log('WARN', `PreparingArchive: File ${pathToFile} does not exist`, loggedInUser);
      return;
    }

    if (fs.statSync(pathToFile).isDirectory()) {
      archive.directory(pathToFile, name);
    } else {
      archive.append(fs.createReadStream(pathToFile), { name });
    }
  });

  archive.on('end', () => {
    log('INFO', `Downloaded ${filesToDownload.length} files from ${resource.fullPathOnDisk}`, loggedInUser);
  });

  archive.on('warning', (err) => {
    log('WARN', `Archive warning: ${err}`, loggedInUser);
  });

  archive.on('error', (err) => {
    log('ERROR', `Archive error: ${err}`, loggedInUser);
  });

  archive.finalize();

  return res;
}
