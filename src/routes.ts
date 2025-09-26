import { Router } from 'express';

import { healthCheckRoutes } from '@features/health-check/health.check.routes.js';
import { firesUpdaterRoutes } from '@features/fires-updater/api/update-fires.routes.js';

export const apiRouter = Router();

apiRouter.use('/health-check', healthCheckRoutes);
apiRouter.use('/fires-updater', firesUpdaterRoutes);
