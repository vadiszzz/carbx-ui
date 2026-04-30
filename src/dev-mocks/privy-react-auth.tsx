// @ts-nocheck
import type { ReactNode } from 'react'

const MOCK_WALLET = '9RMPunW8iLiwxUMXXp8GKMZboX7urnJkwYTsn1xNSAYp'

const mockUser = {
  id: 'did:privy:mock-dev',
  createdAt: new Date(),
  email: { address: 'sulaaf@qist.fi' },
  wallet: {
    address: MOCK_WALLET,
    walletClientType: 'privy',
    chainType: 'solana',
  },
  linkedAccounts: [
    {
      type: 'wallet',
      address: MOCK_WALLET,
      walletClientType: 'phantom',
      chainType: 'solana',
      latestVerifiedAt: new Date(),
    },
  ],
}

export function PrivyProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function usePrivy() {
  return {
    authenticated: true,
    ready: true,
    user: mockUser,
    login: () => {},
    logout: () => {},
    getAccessToken: async () => null,
    linkEmail: () => {},
    linkGoogle: () => {},
    linkWallet: () => {},
    unlinkWallet: () => {},
    exportWallet: () => {},
    createWallet: () => {},
    sendTransaction: async () => ({ signature: '' }),
  }
}
