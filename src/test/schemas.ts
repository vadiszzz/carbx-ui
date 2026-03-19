import { z } from 'zod';

export const SponsoredTxSchema = z.object({
    tx: z.string(),
    errorMessage: z.string().optional().nullable(),
  });