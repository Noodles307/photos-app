import type { LayoutServerLoad } from './$types';
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";

export const load = (async (event) => {
  try {
    return {
      user: await router.createCaller(await createContext(event)).users.currentUser(),
    };
  } catch (e) {
    return {
      user: null
    };
  }
}) satisfies LayoutServerLoad;
