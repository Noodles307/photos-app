import { trpc } from "$lib/trpc/client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => {
  const restrictionID = event.params.id;
  const path = event.url.searchParams.get("path") || '';

  try {
    const folderData = await trpc(event).folders.readFolder.query({
      restrictionID,
      path,
    });

    return {
      folderData,
      error: null,
      restrictionID,
      path,
    }
  } catch (error) {
    return {
      folderData: null,
      error: 'Not found',
      restrictionID,
      path
    };
  }
};
