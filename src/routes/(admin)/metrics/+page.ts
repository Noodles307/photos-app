import { trpc } from '$lib/trpc/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  try {
    const metrics = await trpc(event).metrics.getMetrics.query();
    return { metrics };
  } catch (error) {
    return { metrics: [] };
  }
};
