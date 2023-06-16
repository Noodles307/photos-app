import { trpc } from "$lib/trpc/client";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async (event) => {
  try {
    const users = await trpc(event).users.adminUserList.query();
    return {
      users,
      error: null
    }
  } catch (error) {
    throw redirect(303, '/');
  }
};
