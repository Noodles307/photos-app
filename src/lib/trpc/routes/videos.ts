import { t } from "../t";
import type { User } from "@prisma/client";
import { z } from "zod";
import { getResourceFrom } from "../services/files";
import { ensureLoggedInProcedure } from "../middleware";
import { PERMISSIONS, has } from "$lib/utils/permissions";
import { getVideos, transcodeDirectory, transcodeVideo } from "../services/videos";
import { log } from "../services/logger";

const VideosController = t.router({
  transcodeVideo: ensureLoggedInProcedure
    .input(z.object({
      restrictionID: z.string().uuid(), path: z.string(),
      videoName: z.string()
    }))
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return { error: 'You are not allowed to do this', shareURL: null };
      }

      const resource = await getResourceFrom(req.input.restrictionID, req.input.path, req.ctx.user as User | null);

      if (!resource || !has(resource.permissions, PERMISSIONS.READ | PERMISSIONS.WRITE)) {
        return null;
      }

      await transcodeVideo(resource.fullPathOnDisk, req.input.videoName);
    }),

  transcodeAllVideos: ensureLoggedInProcedure
    .mutation(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return { error: 'You are not allowed to do this', shareURL: null };
      }

      log('INFO', 'Start transcoding all directory', req.ctx.user);

      transcodeDirectory();
    }),

  getVideos: ensureLoggedInProcedure
    .input(z.object({
      skip: z.number(),
      take: z.number(),
      status: z.string().optional(),
    }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return {
          items: [],
          count: 0,
        }
      }

      return getVideos(
        req.ctx.user,
        req.input.take,
        req.input.skip,
        req.input.status,
      );
    }),
});

export default VideosController;
