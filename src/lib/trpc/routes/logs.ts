import { t } from "../t";
import { z } from "zod";
import { ensureLoggedInProcedure } from "../middleware";
import { getLogs } from "../services/logs";

const LogsController = t.router({
  getLogs: ensureLoggedInProcedure
    .input(z.object({
      skip: z.number(),
      take: z.number(),
      level: z.string(),
      search: z.string()
    }))
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return {
          items: [],
          count: 0,
        }
      }

      return getLogs(
        req.ctx.user,
        req.input.take,
        req.input.skip,
        req.input.level,
        req.input.search,
      );
    })
});

export default LogsController;
