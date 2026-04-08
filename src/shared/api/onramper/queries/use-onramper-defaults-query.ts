import { useQuery } from '@tanstack/react-query'
import { fetchOnramperDefaults } from '@/shared/api/onramper/requests'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

export function useOnramperDefaultsQuery(walletAddress?: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ONRAMPER_DEFAULTS(walletAddress),
    queryFn: async () => {
      if (!walletAddress) {
        throw new Error('Wallet address is undefined')
      }

      return fetchOnramperDefaults(walletAddress)
    },
    enabled: enabled && Boolean(walletAddress),
    staleTime: 1000 * 60 * 5,
  })
}
