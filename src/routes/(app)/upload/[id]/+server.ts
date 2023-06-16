import { PATH_TO_ROOT_DIR, generateThumbnails, getResourceFrom } from "$lib/trpc/services/files";
import { getUserFromCookie } from "$lib/utils/cookies";
import { PERMISSIONS, has } from "$lib/utils/permissions";
import busboy from "busboy";
import type { RequestHandler } from "./$types";
import fs from 'fs';
import pathUtils from 'path';
import { log } from "$lib/trpc/services/logger";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import uniqueFilename from 'unique-filename';
import { readStreamToReadable } from "$lib/utils/streams";
import type { User } from "@prisma/client";
import { transcodeDirectory } from "$lib/trpc/services/videos";
import { sanitizeFolderName } from "$lib/utils/string";

interface Input {
  resource: NonNullable<Awaited<ReturnType<typeof getResourceFrom>>>,
  loggedInUser: User,
  headers: Record<string, string>,
  body: ReadableStream<Uint8Array>,
}

const initUploadBusboy = ({
  resource,
  loggedInUser,
  headers,
  body,
}: Input) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const bb = busboy({
        headers,
        limits: {
          files: 1,
          fileSize: 1024 * 1024 * 1024 * 10, // 10GB
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const reqStream = readStreamToReadable(body)

      bb.on('file', (_name, file, info) => {
        const fileName = sanitizeFolderName(info.filename)

        log('INFO', `Uploading file ${fileName} to ${resource.fullPathOnDisk}`, loggedInUser)

        const tmpFilename = uniqueFilename(pathUtils.join(PATH_TO_ROOT_DIR, 'tmp'));
        const writeStream = fs.createWriteStream(tmpFilename);
        file.pipe(writeStream);

        reqStream.on('error', () => {
          try {
            writeStream.destroy();
            fs.unlinkSync(tmpFilename)
            log('ERROR', `Socket error: ${fileName}`, loggedInUser);
          } catch (e) {
            console.log('Socket error', e);
          }
          reject();
        });

        bb.on('error', () => {
          try {
            fs.unlinkSync(tmpFilename)
            log('ERROR', `BusBoy error: ${fileName}`, loggedInUser);
          } catch (e) {
            console.log('BusBoy error: unlinkSync', e);
          }
          reject();
        });

        bb.on('close', () => {
          try {
            log('INFO', `BusBoy closing: ${fileName}`, loggedInUser);
            writeStream.on('close', () => {
              if (fs.existsSync(tmpFilename)) {
                let filePath = pathUtils.normalize(pathUtils.join(
                  resource.fullPathOnDisk,
                  fileName,
                ));

                let count = 0;
                while (fs.existsSync(filePath)) {
                  count++;
                  if (count > 100) {
                    log('ERROR', `BusBoy closing: too many files with the same name: ${filePath}`, loggedInUser);
                    fs.rmSync(tmpFilename)
                    return;
                  }

                  filePath = pathUtils.normalize(pathUtils.join(
                    resource.fullPathOnDisk,
                    `(${count})` + info.filename,
                  ));
                }
                log('INFO', `BusBoy closing: moving ${tmpFilename} to ${filePath}`, loggedInUser);
                fs.copyFileSync(tmpFilename, filePath);
                fs.unlinkSync(tmpFilename);

                generateThumbnails(resource.fullPathOnDisk);
                transcodeDirectory(resource.fullPathOnDisk);
              } else {
                console.log('BusBoy closing: file does not exist', tmpFilename);
              }
              resolve();
            });
          } catch (e) {
            reject(e);
          }
        });
      });

      reqStream.pipe(bb);
    } catch {
      reject();
    }
  });
}

export const POST: RequestHandler = async (req) => {
  try {
    const restrictionId = req.params.id;
    const path = req.url.searchParams.get('path') || '';

    if (!restrictionId) {
      return new Response('Not found', { status: 404 });
    }
    const loggedInUser = await getUserFromCookie(req.cookies.get('authorization') || '');

    if (!loggedInUser) {
      return new Response('Unauthorized', { status: 401 });
    }

    const resource = await getResourceFrom(restrictionId, path, loggedInUser);
    if (!resource || !has(resource.permissions, PERMISSIONS.READ)) {
      return new Response('Not found', { status: 404 });
    }

    const headers: Record<string, string> = {};
    req.request.headers.forEach((value, key) => {
      headers[key] = value;
    })

    if (req.request.body === null) {
      return new Response('Bad request', { status: 400 });
    }

    await initUploadBusboy({
      resource,
      loggedInUser,
      headers,
      body: req.request.body,
    });

    return new Response('OK', { status: 200 });
  } catch {
    return new Response('Internal server error', { status: 500 });
  }
}
