import type { Request, Response } from 'express';
import { validateBody } from '~/middleware/validate.middleware.js';
import { configSchema } from './validation-schemas/start-service.schema.js';
import {
  getFiresObjects,
  startGeneratingMainTiff,
  stopGeneratingMainTiff,
} from '../application/update-fires.service.js';
import {
  updateUserProjectData,
  updateConfig,
  getConfig,
} from '../application/userProjectData.js';

export const startUpdatingFires = async (req: Request, res: Response) => {
  const { interval, region, userId, project } = await validateBody(
    configSchema,
    req,
    res,
  );

  updateUserProjectData({ userId, project });
  updateConfig({ interval, region });

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

export const getFiresObjectsLength = async (req: Request, res: Response) => {
  const { region } = await validateBody(configSchema, req, res);
  const firesObjects = await getFiresObjects(region);

  res.status(200).json({ length: firesObjects.message?.length });
};

export const getServiceStatus = (req: Request, res: Response) => {
  const status = getConfig();

  res.status(200).json({ ok: true, message: status });
};
