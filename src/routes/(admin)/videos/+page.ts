import { trpc } from '$lib/trpc/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
  const take = parseInt(event.url.searchParams.get('take') || "20");
  const skip = parseInt(event.url.searchParams.get('skip') || "0");
  const status = event.url.searchParams.get('status') || '';

  try {
    const { items, count } = await trpc(event).videos.getVideos.query({
      take,
      skip,
      status,
    })

    return {
      take,
      skip,
      status,
      items, count
    };
  } catch (error) {
    return {
      take,
      skip,
      status,
      items: [], count: 0
    }
  }
};
