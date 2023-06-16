import { trpc } from "$lib/trpc/client";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => {
  try {
    const folder = await trpc(event).folders.getFolders.query();
    return folder;
  } catch (e) {
    throw redirect(303, '/logout');
  }
}
