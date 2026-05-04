import { DEMO_GROUPED_ORDERS } from '@/shared/api/demo-responses'
import { apiClient } from '@/shared/api/client'
import { DEMO_MODE } from '@/shared/config/demo-mode'
import { GroupedOrdersSchema } from './schemas'
import type { GroupedOrders } from './types'

export async function fetchGroupedOrders(): Promise<GroupedOrders> {
  if (DEMO_MODE) {
    return GroupedOrdersSchema.parse(DEMO_GROUPED_ORDERS)
  }

  const response = await apiClient.get('/orders/grouped')
  return GroupedOrdersSchema.parse(response.data)
}
