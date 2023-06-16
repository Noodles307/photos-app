import prisma from "$lib/trpc/prisma";
import { log } from "$lib/trpc/services/logger";

const DAY_MS = 1000 * 60 * 60 * 24;

export async function deleteOlderLogs() {
  try {
    await prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - DAY_MS * 30 * 12), // 1 year
        },
      },
    });
  } catch (error) {
    log('CRITICAL', `Cron job failed: DeleteOlderLogs : ${JSON.stringify(error)}`);
  }
}
