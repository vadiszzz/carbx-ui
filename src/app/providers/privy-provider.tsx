import { useEffect, type PropsWithChildren } from 'react'
import {
  PrivyProvider,
  type PrivyClientConfig,
  usePrivy,
} from '@privy-io/react-auth'
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana'
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit'
import { registerPrivyAccessTokenResolver } from '@/shared/api/privy-access-token'

const privyAppId = import.meta.env.VITE_PRIVY_APP_ID
const mockAuth = import.meta.env.VITE_DEV_MOCK_AUTH === 'true'
const rpcUrl = import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com'
const solanaChain = getSolanaChain(rpcUrl)
const walletChainType = 'solana-only' as const

const privyConfig: PrivyClientConfig = {
  loginMethods: ['wallet', 'email', 'google'],
  appearance: {
    walletChainType,
  },
  externalWallets: {
    solana: {
      connectors: toSolanaWalletConnectors(),
    },
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'off',
    },
    solana: {
      createOnLogin: 'users-without-wallets',
    },
  },
  solana: {
    rpcs: {
      [solanaChain]: {
        rpc: createSolanaRpc(rpcUrl),
        rpcSubscriptions: createSolanaRpcSubscriptions(toWebSocketUrl(rpcUrl)),
        blockExplorerUrl: getBlockExplorerUrl(solanaChain),
      },
    },
  },
}

export function AppPrivyProvider({ children }: PropsWithChildren) {
  if (mockAuth) {
    return (
      <>
        <MockPrivyAccessTokenBridge />
        {children}
      </>
    )
  }

  if (!privyAppId) {
    throw new Error('Missing VITE_PRIVY_APP_ID. Add your Privy app ID to initialize auth.')
  }

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <PrivyAccessTokenBridge />
      {children}
    </PrivyProvider>
  )
}

function MockPrivyAccessTokenBridge() {
  useEffect(() => {
    registerPrivyAccessTokenResolver(async () => null)

    return () => {
      registerPrivyAccessTokenResolver(null)
    }
  }, [])

  return null
}

function PrivyAccessTokenBridge() {
  const { getAccessToken } = usePrivy()

  useEffect(() => {
    registerPrivyAccessTokenResolver(() => getAccessToken())

    return () => {
      registerPrivyAccessTokenResolver(null)
    }
  }, [getAccessToken])

  return null
}

function getSolanaChain(rpc: string): 'solana:mainnet' | 'solana:devnet' | 'solana:testnet' {
  const normalized = rpc.toLowerCase()

  if (normalized.includes('devnet')) {
    return 'solana:devnet'
  }

  if (normalized.includes('testnet')) {
    return 'solana:testnet'
  }

  return 'solana:mainnet'
}

function toWebSocketUrl(url: string) {
  if (url.startsWith('https://')) {
    return `wss://${url.slice('https://'.length)}`
  }

  if (url.startsWith('http://')) {
    return `ws://${url.slice('http://'.length)}`
  }

  return url
}

function getBlockExplorerUrl(chain: 'solana:mainnet' | 'solana:devnet' | 'solana:testnet') {
  if (chain === 'solana:devnet') {
    return 'https://explorer.solana.com/?cluster=devnet'
  }

  if (chain === 'solana:testnet') {
    return 'https://explorer.solana.com/?cluster=testnet'
  }

  return 'https://explorer.solana.com'
}
