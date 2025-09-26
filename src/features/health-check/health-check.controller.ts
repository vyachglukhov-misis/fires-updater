import type { Request, Response } from 'express';

export const healthCheckHandler = async (req: Request, res: Response) => {
  const body = {
    message: 'OK',
    timestamp: Date.now(),
    uptime: process.uptime(),
  };
  res.status(200).json(body);
};
