import { log } from "$lib/trpc/services/logger";
import { getUserFromCookie } from "$lib/utils/cookies";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/trpc/prisma";
import { transcodeVideo } from "$lib/trpc/services/videos";
import path from "path";

export const GET: RequestHandler = async (req) => {
  const user = await getUserFromCookie(req.cookies.get('authorization') || '');

  try {
    const id = parseInt(req.params.id);

    const video = await prisma.video.findFirst({
      where: { id },
    });

    if (!video) {
      throw error(404, "Video not found");
    }

    const fullPath = video.fullPath.replace(path.basename(video.fullPath), '')
    await transcodeVideo(fullPath, video.name);
  } catch (err) {
    log("ERROR", `[BUNNY] Could not retry transcode video: ${JSON.stringify(err)}`, user);
    throw error(500, "Could not retry transcode video");
  }

  throw redirect(300, `/videos`);
}
