import { z } from 'zod'
import { SponsoredTxTypeSchema } from './types'

const solanaAddressSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)

export const SponsoredTransactionParamsSchema = z.object({
  txType: SponsoredTxTypeSchema,
  user: solanaAddressSchema.optional(),
  userPubkey: solanaAddressSchema.optional(),
  registry: solanaAddressSchema.optional(),
  amount: z.number().finite().min(0),
  carbxRetireUuid: z.string().min(1).optional(),
  price: z.number().finite().min(0).optional(),
  listing: solanaAddressSchema.optional(),
  seller: solanaAddressSchema.optional(),
  listingRentPayer: solanaAddressSchema.optional(),
  puroUserUuid: z.string().min(1).optional(),
  tokenMint: solanaAddressSchema.optional(),
  recipient: solanaAddressSchema.optional(),
})

export const SponsoredTransactionResponseSchema = z.object({
  tx: z.string(),
  errorMessage: z.string().optional(),
})
