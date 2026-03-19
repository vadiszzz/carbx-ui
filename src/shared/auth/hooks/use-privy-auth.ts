import { usePrivy } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth/solana'
import {
  getLinkedSolanaWallet,
  getPrimaryAuthMethodLabel,
} from '@/shared/auth/lib/privy-user'

export function usePrivyAuth() {
  const { authenticated, user } = usePrivy()
  const { wallets } = useWallets()

  const connectedWallet = wallets[0] ?? null
  const linkedWallet = getLinkedSolanaWallet(user)

  return {
    authenticated,
    connected: Boolean(connectedWallet),
    connectedWallet,
    linkedWallet,
    hasSolanaWallet: Boolean(connectedWallet || linkedWallet),
    walletAddress: connectedWallet?.address ?? linkedWallet?.address ?? '',
    walletName:
      connectedWallet?.standardWallet.name ?? linkedWallet?.walletClientType ?? null,
    authMethodLabel: getPrimaryAuthMethodLabel(user),
  }
}
