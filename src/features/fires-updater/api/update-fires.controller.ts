import type { Request, Response } from 'express';
import { validateBody } from '~/middleware/validate.middleware.js';
import { configSchema } from './validation-schemas/start-service.schema.js';
import {
  startGeneratingMainTiff,
  stopGeneratingMainTiff,
} from '../application/update-fires.service.js';

export const startUpdatingFires = async (req: Request, res: Response) => {
  const { interval, region } = await validateBody(configSchema, req, res);

  const startGeneratingMainTiffResult = startGeneratingMainTiff(
    interval,
    region,
  );

  const responseCode = startGeneratingMainTiffResult.ok ? 200 : 409;

  res.status(responseCode).json(startGeneratingMainTiffResult);
};

export const stopUpdatingFires = async (req: Request, res: Response) => {
  const stopGeneratingMainTiffResult = stopGeneratingMainTiff();

  const responseCode = stopGeneratingMainTiffResult.ok ? 200 : 409;

  res.status(responseCode).json(stopGeneratingMainTiffResult);
};
