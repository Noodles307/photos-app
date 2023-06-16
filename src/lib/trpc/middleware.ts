import { TRPCError } from "@trpc/server";
import { t } from "./t";

export const ensureLoggedInProcedure = t.procedure.use(
  t.middleware((opts) => {
    const { ctx } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  })
);
