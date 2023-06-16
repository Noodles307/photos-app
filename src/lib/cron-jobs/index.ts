import cron from 'node-cron';
import { applyRestrictionModifiers } from './applyRestrictionModifers';
import { deleteOlderLogs } from './deleteOlderLogs';
import { log } from '$lib/trpc/services/logger';
import { generateThumbnails } from '$lib/trpc/services/files';

export const startCronJobs = () => {
  // Once a day
  cron.schedule('0 0 */1 * *', () => {
    log('INFO', 'Running cron job: ApplyRestriction');
    return applyRestrictionModifiers()
  });

  // Once a day
  cron.schedule('0 0 */1 * *', () => {
    log('INFO', 'Running cron job: GenerateThumbnails');
    return generateThumbnails()
  });

  // Once a week
  cron.schedule('0 0 */7 * *', () => {
    log('INFO', 'Running cron job: DeleteOlderLogs');
    return deleteOlderLogs();
  });
}
