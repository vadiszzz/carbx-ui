import { apiClient } from '@/shared/api/client'
import {
  SponsoredTransactionParamsSchema,
  SponsoredTransactionResponseSchema,
} from './schemas'
import type {
  SponsoredTransactionParams,
  SponsoredTransactionResponse,
} from './types'

export async function fetchSponsoredTransaction(
  params: SponsoredTransactionParams
): Promise<SponsoredTransactionResponse> {
  const parsedParams = SponsoredTransactionParamsSchema.parse(params)
  const response = await apiClient.get('/sponsored-transaction', {
    params: parsedParams,
  })

  return SponsoredTransactionResponseSchema.parse(response.data)
}
