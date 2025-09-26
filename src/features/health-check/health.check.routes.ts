import { Router } from 'express';

import { healthCheckHandler } from './health-check.controller.js';
import { asyncHandler } from '~/utils/async-handler.js';

const router = Router();

router.get('/', asyncHandler(healthCheckHandler));

export { router as healthCheckRoutes };
