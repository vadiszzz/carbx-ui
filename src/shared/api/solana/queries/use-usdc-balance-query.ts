import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Connection, PublicKey } from '@solana/web3.js'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import { RPC_URL, USDC_MINT } from '@/shared/constants/solana'

const MOCK_AUTH = import.meta.env.VITE_DEV_MOCK_AUTH === 'true'

export function useUsdcBalanceQuery(walletAddress?: string) {
  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), [])

  return useQuery({
    queryKey: QUERY_KEYS.USDC_BALANCE(walletAddress),
    queryFn: async () => {
      if (MOCK_AUTH) return 164.26

      if (!walletAddress) {
        throw new Error('Wallet address is undefined')
      }

      const owner = new PublicKey(walletAddress)
      const mint = new PublicKey(USDC_MINT)
      const response = await connection.getParsedTokenAccountsByOwner(
        owner,
        { mint },
        'confirmed'
      )

      const balance = response.value.reduce((sum, account) => {
        const parsed = account.account.data
        if (!('parsed' in parsed)) return sum

        const tokenAmount = parsed.parsed.info.tokenAmount
        const uiAmount = Number(tokenAmount.uiAmountString ?? tokenAmount.uiAmount ?? 0)
        if (!Number.isFinite(uiAmount)) return sum

        return sum + uiAmount
      }, 0)

      return balance
    },
    enabled: Boolean(walletAddress),
    staleTime: 1000 * 30,
  })
}
