import { getResourceFrom } from "$lib/trpc/services/files";
import { logExecutionTime } from "$lib/trpc/services/metrics";
import { getUserFromCookie } from "$lib/utils/cookies";
import { PERMISSIONS, has } from "$lib/utils/permissions";
import type { RequestHandler } from "./$types";
import fs from 'fs';
import pathUtils from 'path';

export const GET: RequestHandler = async (req) => {
  const before = Date.now();

  try {
    const restrictionId = req.params.id;
    const path = req.url.searchParams.get('path') || '';

    if (!restrictionId) {
      return new Response('Not found', { status: 404 });
    }

    const loggedInUser = await getUserFromCookie(req.cookies.get('authorization') || '');

    const resource = await getResourceFrom(restrictionId, '', loggedInUser);
    if (!resource || !has(resource.permissions, PERMISSIONS.READ)) {
      return new Response('Not found', { status: 404 });
    }

    const filePath = pathUtils.normalize(pathUtils.join(
      resource.fullPathOnDisk,
      path));

    console.log(`file/${restrictionId}`, filePath)

    if (!fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 });
    }

    const durationMs = Date.now() - before;
    logExecutionTime(durationMs, '/file');

    const fileStream = fs.createReadStream(filePath)

    // @ts-ignore
    const res = new Response(fileStream);
    res.headers.set('Cache-control', `private, max-age=${60 * 60 * 24}`)
    res.headers.set('Content-Disposition', `attachment; filename=${pathUtils.basename(filePath)}`);

    return res;
  } catch (e) {
    return new Response('Not found', { status: 404 });
  }
}
