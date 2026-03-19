import type { SponsoredTxSchema } from "./schemas";
import { z } from 'zod';

export type SponsoredTx = z.infer<typeof SponsoredTxSchema>;