import { Router } from 'express';
import {
  startUpdatingFires,
  stopUpdatingFires,
} from './update-fires.controller.js';
import { asyncHandler } from '~/utils/async-handler.js';

const router = Router();

router.post('/start', asyncHandler(startUpdatingFires));
router.post('/stop', asyncHandler(stopUpdatingFires));

export { router as firesUpdaterRoutes };
