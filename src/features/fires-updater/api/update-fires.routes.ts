import { Router } from 'express';
import {
  getFiresObjectsLength,
  getServiceStatus,
  startUpdatingFires,
  stopUpdatingFires,
} from './update-fires.controller.js';
import { asyncHandler } from '~/utils/async-handler.js';

const router = Router();

router.post('/start', asyncHandler(startUpdatingFires));
router.post('/stop', asyncHandler(stopUpdatingFires));
router.post('/objects-length', asyncHandler(getFiresObjectsLength));
router.get('/status', getServiceStatus);

export { router as firesUpdaterRoutes };
