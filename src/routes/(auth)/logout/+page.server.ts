import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async (req) => {
  req.cookies.delete("authorization");
  throw redirect(303, "/login");
}) satisfies PageServerLoad;
