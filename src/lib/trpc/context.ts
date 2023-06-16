import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import { getUserFromCookie } from '$lib/utils/cookies';

export async function createContext(event: RequestEvent) {
  const user = await getUserFromCookie(event.cookies.get('authorization') || '');
  return {
    user, 
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
