import type { Log, User } from "@prisma/client";
import prisma from "../prisma";
import { log } from "./logger";

export async function getLogs(user: User, take = 20, skip = 0, level?: string, search?: string): Promise<{
  items: Log[],
  count: number,
}> {
  const options = {
    take, skip,
    orderBy: { createdAt: 'desc' },
    where: {},
  }

  if (level) {
    options.where = {
      level
    }
  }

  if (search) {
    options.where = {
      ...options.where,
      message: { contains: search, mode: 'insensitive' }
    };
  }

  try {
    const count = await prisma.log.count({ where: options.where});
    const items = await prisma.log.findMany(options as any);

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
