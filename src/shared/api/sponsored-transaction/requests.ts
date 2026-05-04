import { DEMO_SPONSORED_TX_RESPONSE } from '@/shared/api/demo-responses'
import { apiClient } from '@/shared/api/client'
import { DEMO_MODE } from '@/shared/config/demo-mode'
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

  if (DEMO_MODE) {
    return SponsoredTransactionResponseSchema.parse(DEMO_SPONSORED_TX_RESPONSE)
  }

  const response = await apiClient.get('/sponsored-transaction', {
    params: parsedParams,
  })

  return SponsoredTransactionResponseSchema.parse(response.data)
}
