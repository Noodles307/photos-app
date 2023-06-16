import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";
import type { User } from "@prisma/client";

export const load = (async ({ parent }) => {
	const data = await parent() as unknown as { user: User | null };

  if (data?.user?.email) {
    throw redirect(303, '/');
  }
}) satisfies PageServerLoad;

export const actions = {
  default: async (event) => {
    const data = await event.request.formData();

    try {
      const response = await router.createCaller(await createContext(event)).users.login({
        email: data.get('email') as string,
        password: data.get('password') as string,
      });

      if (response.error) {
        return fail(400, { email: data.get('email'), incorrect: true });
      }

      if (response.token) {
        event.cookies.set('authorization', response.token, {
          path: '/',
          secure: false,
          httpOnly: true,
        });
      }

    } catch (err) {
      return fail(400, { email: data.get('email'), incorrect: true });
    }

    throw redirect(303, '/');
  },
} satisfies Actions;
