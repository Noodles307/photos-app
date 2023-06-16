import type { User } from "@prisma/client";
import { decodeJWT } from "./jwt";
import prisma from "$lib/trpc/prisma";

export async function getUserFromCookie(cookie: string): Promise<User | null> {
  try {
    const decodedUserInfo = await decodeJWT(cookie || '');

    if (decodedUserInfo) {
      const loggedInUser = await prisma.user.findUnique({
        where: { email: decodedUserInfo.email },
      });

      return loggedInUser as User;
    } 
  } catch (error) { /* noop */ }

  return null;
}
