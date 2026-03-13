import { apiClient } from '@/shared/api/client'
import { CreateRetirePayloadSchema, CreateRetireResponseSchema } from './schemas'
import type { CreateRetirePayload, CreateRetireResponse } from './types'

export async function createRetire(
  payload: CreateRetirePayload
): Promise<CreateRetireResponse> {
  const parsedPayload = CreateRetirePayloadSchema.parse(payload)
  const response = await apiClient.post('/retire/create', parsedPayload)
  return CreateRetireResponseSchema.parse(response.data)
}
