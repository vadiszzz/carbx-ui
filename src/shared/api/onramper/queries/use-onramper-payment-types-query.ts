import { useQuery } from '@tanstack/react-query'
import { fetchOnramperPaymentMethods } from '@/shared/api/onramper/requests'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

type UseOnramperPaymentTypesQueryParams = {
  sourceCurrency?: string
  destinationCurrency?: string
  countryCode?: string
  enabled?: boolean
}

export function useOnramperPaymentTypesQuery({
  sourceCurrency,
  destinationCurrency,
  countryCode,
  enabled = true,
}: UseOnramperPaymentTypesQueryParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ONRAMPER_PAYMENT_TYPES({
      sourceCurrency,
      destinationCurrency,
      countryCode,
    }),
    queryFn: async () => {
      if (!sourceCurrency || !destinationCurrency || !countryCode) {
        throw new Error('Onramper payment types params are incomplete')
      }

      return fetchOnramperPaymentMethods({
        sourceCurrency,
        destinationCurrency,
        countryCode,
      })
    },
    enabled: enabled && Boolean(sourceCurrency && destinationCurrency && countryCode),
    staleTime: 1000 * 60 * 5,
  })
}
