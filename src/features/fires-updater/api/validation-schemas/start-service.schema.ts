import z from 'zod';
import { REGIONS } from '../../domain/enums/regions.enum.js';

export const configSchema = z.object({
  interval: z.number().min(1, { error: 'interval is required' }),
  region: z.enum(REGIONS, { error: 'correct region is required ' }),
});
