import type { User, Video } from "@prisma/client";
import fs from 'fs';
import mime from "mime-types";
import 'dotenv/config'
import fetch from 'node-fetch';
import prisma from "../prisma";
import { createReadStream } from "fs";
import { log } from "./logger";
import path from "path";
import { PATH_TO_ROOT_DIR, ROOT_DATA_PATH } from "./files";

export async function getVideos(user: User, take = 20, skip = 0, status?: string): Promise<{
  items: Video[],
  count: number,
}> {
  const options = {
    take, skip,
    where: {},
    orderBy: { createdAt: 'desc' },
  }

  if (status) {
    options.where = {
      status
    }
  }

  try {
    const count = await prisma.video.count({ where: options.where });
    const items = await prisma.video.findMany(options as any);

    return {
      items,
      count,
    };
  } catch (error) {
    log('ERROR', `Could not get logs: ${JSON.stringify(error)}`, user)
  }

  return {
    items: [],
    count: 0,
  };
  
}

export async function transcodeVideo(fullPath: string, videoName: string) {
  const videoPath = path.normalize(path.join(fullPath, videoName));

  try {
    const existingVideo = await findVideoByPath(videoPath);

    if (existingVideo) {
      deleteVideoFromCDN(existingVideo);
    }

    uploadNewVideoToCDN(videoPath);
  } catch (e) {
    const existingVideo = await prisma.video.findFirst({ where: { fullPath: videoPath } })
    if (existingVideo) {
      await prisma.video.update({
        where: { id: existingVideo.id },
        data: {
          status: 'ERROR',
        }
      })
    }

    log('ERROR', `CDN: video ${videoName} failed to upload with ${JSON.stringify(e)}}`);
  }
}

export function findVideoByPath(videoPath: string) {
  return prisma.video.findFirst({
    where: { fullPath: videoPath },
  })
}

export async function deleteVideoFromCDN(existingVideo: Video) {
  await fetch(`${process.env.BUNNY_CDN_URL}${process.env.BUNNY_LIBRARY_ID}/videos/${existingVideo.cdnKey}`, {
    method: 'DELETE',
    headers: {
      accept: 'application/json',
      'content-type': 'application/*+json',
      AccessKey: process.env.BUNNY_API_KEY as string,
    },
  })
  await prisma.video.delete({ where: { id: existingVideo.id } });
}

export async function uploadNewVideoToCDN(videoPath: string) {
  if (!fs.existsSync(videoPath)) {
    return;
  }

  log('INFO', `CDN: get video id for: ${videoPath}`);

  const response = await fetch(`${process.env.BUNNY_CDN_URL}${process.env.BUNNY_LIBRARY_ID}/videos`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/*+json',
      AccessKey: process.env.BUNNY_API_KEY as string,
    },
    body: JSON.stringify({ title: path.basename(videoPath) }),
  })

  const body = await response.json();

  const newVideo = await prisma.video.create({
    data: {
      cdnKey: body.guid,
      name: path.basename(videoPath),
      fullPath: videoPath,
      status: 'UPLOADING',
    }
  });

  log('INFO', `CDN: video id for: ${videoPath} is ${body.guid}`);
  const stream = createReadStream(videoPath);

  const uploadResponse = await fetch(`${process.env.BUNNY_CDN_URL}${process.env.BUNNY_LIBRARY_ID}/videos/${body.guid}`, {
    method: 'PUT',
    headers: {
      accept: 'application/json',
      AccessKey: process.env.BUNNY_API_KEY as string,
      'content-type': 'application/octet-stream'
    },
    body: stream,
  });

  const uploadBody = await uploadResponse.json();

  log('INFO', `CDN: video ${body.guid} uploaded with ${JSON.stringify(uploadBody)}}`);

  return await prisma.video.update({
    where: { id: newVideo.id },
    data: {
      status: 'UPLOADED',
    }
  })
}


export async function transcodeDirectory(root = path.join(PATH_TO_ROOT_DIR, ROOT_DATA_PATH)) {
  const files = fs.readdirSync(root);

  for (const file of files) {
    const filePath = path.join(root, file);

    const stat = fs.statSync(filePath);

    const isDirectory = stat.isDirectory();
    if (isDirectory) {
      transcodeDirectory(filePath);
      continue;
    }

    const mimeType = mime.lookup(file) || '';
    if (!mimeType.startsWith('video')) {
      continue;
    }

    try {
      console.log('filePath', filePath);
      const existing = await findVideoByPath(filePath);
      if (!existing) {
        await uploadNewVideoToCDN(filePath)
      }
    } catch (e) {
      const existingVideo = await prisma.video.findFirst({ where: { fullPath: filePath } })
      if (existingVideo) {
        await prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            status: 'ERROR',
          }
        })
      }

      log('ERROR', `CDN: video ${filePath} failed to upload with ${JSON.stringify(e)}}`);
    }
  }
}
