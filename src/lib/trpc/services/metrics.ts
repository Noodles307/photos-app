import prisma from "../prisma";
import { log } from "./logger";

export async function logExecutionTime(durationMs: number, name: string) {
  try {
    await prisma.metric.create({
      data: {
        durationMs,
        name,
      }
    })
  } catch (e) {
    log('ERROR', `Failed to log metric: ${name}: ${durationMs}ms :: ${JSON.stringify(e)}`);
  }
}

interface FunctionMetric {
  name: string;
  durationMs: number;
}

export async function getMetrics() {
  try {
    const metrics = await prisma.$queryRawUnsafe<FunctionMetric[] | null>(`
    select name, avg("durationMs") as "durationMs" 
    from "Metric" m 
    where m."createdAt" > now() - interval '30 days'
    group by "name"
  `);

    return metrics;
  } catch (e) {
    log('ERROR', `Failed to get metrics: ${JSON.stringify(e)}`);
    return [];
  }
}
