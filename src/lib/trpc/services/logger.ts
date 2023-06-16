import type { User } from "@prisma/client";
import prisma from "../prisma";

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'DEBUG';

export async function log(level: LogLevel, message: string, user?: User | null) {
  const userName = user?.name || 'unknown';
  console.log(`[${level} (${userName})] ${message}`);

  try {
    await prisma.log.create({
      data: {
        level: level as string,
        message,
        userId: user?.id || null,
      }
    });
  } catch (e) {
    console.error(e);
  }
}

export async function clearAllLogs() {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await prisma.log.deleteMany({
      where: {
        createdAt: {
          lte: oneMonthAgo,
        }
      }
    });
  } catch (e) {
    log('ERROR', `Failed to clear logs on ${new Date().toISOString()}`);
  }
}

