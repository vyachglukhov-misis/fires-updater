import z from 'zod';
import { REGIONS } from '../../domain/enums/regions.enum.js';

export const configSchema = z.object({
  interval: z
    .number()
    .min(1, { error: 'correct number for interval is required' }),
  region: z.enum(REGIONS, { error: 'correct region is required' }),
  project: z.string({ error: 'correct string for project is required' }),
  userId: z.string({ error: 'correct string for userId is required' }),
});
