import FoldersController from './routes/folders';
import LogsController from './routes/logs';
import MetricsController from './routes/metrics';
import RestrictionsController from './routes/restrictions';
import UsersController from './routes/user';
import VideosController from './routes/videos';
import { t } from './t';

export const router = t.router({
  users: UsersController,
  folders: FoldersController,
  videos: VideosController,
  logs: LogsController,
  metrics: MetricsController,
  restrictions: RestrictionsController,
});

export type Router = typeof router;
