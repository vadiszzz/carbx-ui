import { useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useUsdcBalanceQuery } from '@/shared/api/solana/queries/use-usdc-balance-query'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import {
  getAuthIdentityLabel,
  getLinkedSolanaWallet,
  getPrimaryAuthMethodLabel,
} from '@/shared/auth/lib/privy-user'

export function PrivyAccountSummary() {
  const { authenticated, ready, user } = usePrivy()
  const { walletAddress } = usePrivyAuth()

  const linkedWallet = getLinkedSolanaWallet(user)
  const authMethod = getPrimaryAuthMethodLabel(user)
  const authIdentity = getAuthIdentityLabel(user)
  const usdcBalanceQuery = useUsdcBalanceQuery(walletAddress)

  const linkedWalletLabel = useMemo(() => {
    if (!linkedWallet) return 'No linked Solana wallet'
    return linkedWallet.address
  }, [linkedWallet])

  return (
    <div className="grid gap-4 rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">Status</span>
        <span
          className={[
            'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
            authenticated
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-200 text-slate-700',
          ].join(' ')}
        >
          {ready
            ? authenticated
              ? 'Authorized'
              : 'Not authorized'
            : 'Loading'}
        </span>
      </div>

      <div className="grid gap-2 text-sm text-slate-600">
        <p className="m-0">
          <span className="font-medium text-slate-800">Auth method:</span>{' '}
          {authMethod}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Identity:</span>{' '}
          {authIdentity ?? 'Not linked yet'}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Solana wallet:</span>{' '}
          {linkedWalletLabel}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Balance:</span>{' '}
          {walletAddress
            ? usdcBalanceQuery.isLoading || usdcBalanceQuery.isFetching
              ? 'Loading...'
              : `${formatUsdcBalance(usdcBalanceQuery.data ?? 0)} USDC`
            : 'No wallet'}
        </p>
      </div>
    </div>
  )
}

function formatUsdcBalance(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
