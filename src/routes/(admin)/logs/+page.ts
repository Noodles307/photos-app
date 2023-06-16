import { trpc } from '$lib/trpc/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const take = parseInt(event.url.searchParams.get('take') || "20");
  const skip = parseInt(event.url.searchParams.get('skip') || "0");
  const level = event.url.searchParams.get('level') || '';
  const search = event.url.searchParams.get('search') || '';

  try {
    const { items, count } = await trpc(event).logs.getLogs.query({
      take,
      skip,
      level,
      search,
    })

    return {
      take,
      skip,
      level,
      search,
      items, count
    };
  } catch (error) {
    return {
      take,
      skip,
      level,
      search,
      items: [], count: 0
    }
  }
};
