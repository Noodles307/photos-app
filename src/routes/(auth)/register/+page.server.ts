import { fail, redirect } from "@sveltejs/kit";
import { trpc } from "$lib/trpc/client";
import type { Actions, PageServerLoad } from "./$types";
import { router } from "$lib/trpc/router";
import { createContext } from "$lib/trpc/context";
import type { User } from "@prisma/client";
import type { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export const load = (async (event) => {
  const inviteHash = event.url.searchParams.get('invite') || '';

  const data = await event.parent() as unknown as { user: User | null };
  const invitedUser = await trpc(event).users.getUserByInviteHash.query(inviteHash);

  if (!invitedUser) {
    throw redirect(303, '/');
  }

  if (data?.user?.email) {
    event.cookies.delete('authorization');
  }

  return {
    invitedUser,
  };
}) satisfies PageServerLoad;

export const actions = {
  default: async (event) => {
    const data = await event.request.formData();

    try {
      const response = await router.createCaller(await createContext(event)).users.register({
        email: data.get('email') as string,
        name: data.get('name') as string,
        password: data.get('password') as string,
        inviteHash: data.get('inviteHash') as string,
      });

      console.log('step1', response);

      if (response.error) {
        return fail(400, { email: data.get('email'), incorrect: response.error });
      }

      if (response.token) {
        event.cookies.set('authorization', response.token, {
          path: '/',
          secure: false,
          httpOnly: true,
        });
      }
    } catch (err) {
      const error = (err) as unknown as TRPCError;

      if (error.cause instanceof ZodError) {
        console.log('error.message', JSON.stringify(error.cause.issues));
        if ( error.cause.issues.length > 0) {
          const issue = error.cause.issues[0];
          return fail(400, {
            incorrect: `${issue.path} ${issue.message}`.toLowerCase(),
          });
        }
      }
      return fail(400, { email: data.get('email'), incorrect: 'Something went wrong' });
    }

    console.log('step2', 'redirecting');
    throw redirect(303, '/');
  },
} satisfies Actions;
