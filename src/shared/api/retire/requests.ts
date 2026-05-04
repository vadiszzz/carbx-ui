import { DEMO_RETIRE_RESPONSE } from '@/shared/api/demo-responses'
import { DEMO_MODE } from '@/shared/config/demo-mode'
import { apiClient } from '@/shared/api/client'
import { CreateRetirePayloadSchema, CreateRetireResponseSchema } from './schemas'
import type { CreateRetirePayload, CreateRetireResponse } from './types'

export async function createRetire(
  payload: CreateRetirePayload
): Promise<CreateRetireResponse> {
  const parsedPayload = CreateRetirePayloadSchema.parse(payload)

  if (DEMO_MODE) {
    return CreateRetireResponseSchema.parse(DEMO_RETIRE_RESPONSE)
  }

  const response = await apiClient.post('/retire/create', parsedPayload)
  return CreateRetireResponseSchema.parse(response.data)
}
