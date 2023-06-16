import { t } from "../t";
import { ensureLoggedInProcedure } from "../middleware";
import { getMetrics } from "../services/metrics";

const MetricsController = t.router({
  getMetrics: ensureLoggedInProcedure
    .query(async (req) => {
      if (req.ctx.user.role !== 'ADMIN') {
        return [];
      }

      return getMetrics();
    })
});

export default MetricsController;
