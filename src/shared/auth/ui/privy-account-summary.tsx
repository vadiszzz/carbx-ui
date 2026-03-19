import { useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth/solana'
import {
  getAuthIdentityLabel,
  getLinkedSolanaWallet,
  getLinkedSolanaWallets,
  getPrimaryAuthMethodLabel,
  getWalletClientLabel,
} from '@/shared/auth/lib/privy-user'

export function PrivyAccountSummary() {
  const { authenticated, ready, user } = usePrivy()
  const { wallets } = useWallets()

  const connectedWallet = wallets[0] ?? null
  const linkedWallet = getLinkedSolanaWallet(user)
  const linkedSolanaWallets = getLinkedSolanaWallets(user)
  const authMethod = getPrimaryAuthMethodLabel(user)
  const authIdentity = getAuthIdentityLabel(user)

  const connectedWalletLabel = useMemo(() => {
    if (!connectedWallet) return 'No connected wallet'
    return `${connectedWallet.standardWallet.name} - ${shortenAddress(connectedWallet.address)}`
  }, [connectedWallet])

  const linkedWalletLabel = useMemo(() => {
    if (!linkedWallet) return 'No linked Solana wallet'
    return `${getWalletClientLabel(linkedWallet.walletClientType)} - ${shortenAddress(linkedWallet.address)}`
  }, [linkedWallet])

  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
          {ready ? (authenticated ? 'Authorized' : 'Not authorized') : 'Loading'}
        </span>
      </div>

      <div className="grid gap-1 text-sm text-slate-600">
        <p className="m-0">
          <span className="font-medium text-slate-800">Method:</span> {authMethod}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Identity:</span>{' '}
          {authIdentity ?? 'Not linked yet'}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Connected wallet:</span>{' '}
          {connectedWalletLabel}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Linked Solana wallet:</span>{' '}
          {linkedWalletLabel}
        </p>
        <p className="m-0">
          <span className="font-medium text-slate-800">Linked Solana wallets:</span>{' '}
          {linkedSolanaWallets.length}
        </p>
      </div>
    </div>
  )
}

function shortenAddress(address: string) {
  if (address.length <= 18) return address
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}
