import { DEMO_MODE } from '@/shared/config/demo-mode'
import { DEMO_PURO_ACCOUNT } from '@/shared/api/demo-responses'
import { apiClient } from '@/shared/api/client'
import { PuroAccountSchema } from './schemas'
import type { PuroAccount } from './types'

export async function fetchPuroAccount(): Promise<PuroAccount> {
  if (DEMO_MODE) {
    return DEMO_PURO_ACCOUNT
  }

  const response = await apiClient.get('/users/puro-account')
  return PuroAccountSchema.parse(response.data)
}
