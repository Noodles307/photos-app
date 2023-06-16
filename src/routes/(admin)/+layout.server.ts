import type { LayoutServerLoad } from './$types';
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";
import { redirect } from '@sveltejs/kit';

export const load = (async (event) => {
  try {
    const user = await router.createCaller(await createContext(event)).users.currentUser();


    if (!user || user.role !== 'ADMIN') {
      throw redirect(303, '/');
    }

    return {
      user
    };
  } catch (error) {
    console.log(error);
    throw redirect(303, '/');
  }
}) satisfies LayoutServerLoad;
