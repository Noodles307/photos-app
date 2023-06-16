import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import 'dotenv/config'
import { startCronJobs } from '$lib/cron-jobs';
import fs from 'fs';
import path from 'path';

import 'sharp';
import { PATH_TO_ROOT_DIR } from '$lib/trpc/services/files';

const dataPath = path.join(PATH_TO_ROOT_DIR, 'data');
const cachePath = path.join(PATH_TO_ROOT_DIR, 'cache');
const tmpPath = path.join(PATH_TO_ROOT_DIR, 'tmp');

// Create uploads folder if it doesn't exist
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}
if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath, { recursive: true });
}
if (!fs.existsSync(tmpPath)) {
  fs.mkdirSync(tmpPath, { recursive: true });
}

startCronJobs();

export const handle: Handle = createTRPCHandle({ router, createContext });
