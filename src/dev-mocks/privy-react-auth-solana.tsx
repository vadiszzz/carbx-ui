// @ts-nocheck
const MOCK_WALLET = '9RMPunW8iLiwxUMXXp8GKMZboX7urnJkwYTsn1xNSAYp'

export function useWallets() {
  return {
    wallets: [
      {
        address: MOCK_WALLET,
        walletClientType: 'phantom',
        standardWallet: { name: 'Mock Wallet' },
      },
    ],
    ready: true,
  }
}

export function useSignAndSendTransaction() {
  return {
    signAndSendTransaction: async () => ({ signature: 'MockTxSignature' }),
  }
}

export function toSolanaWalletConnectors() {
  return []
}
