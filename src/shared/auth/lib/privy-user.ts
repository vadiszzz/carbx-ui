import type { User } from '@privy-io/react-auth'

type LinkedAccount = User['linkedAccounts'][number]

type SolanaWalletAccount = Extract<LinkedAccount, { type: 'wallet' }> & {
  chainType: 'solana'
}

export function getLinkedSolanaWallets(user: User | null): SolanaWalletAccount[] {
  if (!user) return []

  const wallets = user.linkedAccounts.filter(
    (account): account is SolanaWalletAccount =>
      account.type === 'wallet' && account.chainType === 'solana'
  )

  return sortByLatestVerification(wallets)
}

export function getLinkedSolanaWallet(user: User | null): SolanaWalletAccount | null {
  return getLinkedSolanaWallets(user)[0] ?? null
}

export function getPrimaryAuthMethodLabel(user: User | null) {
  if (!user) return 'Not authorized'

  const account = sortByLatestVerification(user.linkedAccounts)[0]

  if (!account) return 'Authorized'

  switch (account.type) {
    case 'wallet':
      return `${formatWalletClientType(account.walletClientType)} wallet`
    case 'email':
      return 'Email'
    case 'google_oauth':
      return 'Google'
    case 'twitter_oauth':
      return 'Twitter'
    case 'discord_oauth':
      return 'Discord'
    case 'github_oauth':
      return 'GitHub'
    case 'apple_oauth':
      return 'Apple'
    default:
      return formatAccountType(account.type)
  }
}

export function getAuthIdentityLabel(user: User | null) {
  if (!user) return null

  const account = sortByLatestVerification(user.linkedAccounts)[0]

  if (!account) return null

  if ('address' in account && typeof account.address === 'string') {
    return shortenValue(account.address)
  }

  if ('email' in account && typeof account.email === 'string') {
    return account.email
  }

  return null
}

export function getWalletClientLabel(walletClientType?: string) {
  return formatWalletClientType(walletClientType)
}

function sortByLatestVerification<T extends { latestVerifiedAt: Date | null }>(accounts: T[]) {
  return [...accounts].sort((first, second) => {
    const firstTime = first.latestVerifiedAt?.getTime() ?? 0
    const secondTime = second.latestVerifiedAt?.getTime() ?? 0
    return secondTime - firstTime
  })
}

function formatWalletClientType(walletClientType?: string) {
  if (!walletClientType) return 'Connected'

  return walletClientType
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatAccountType(type: string) {
  return type
    .replace(/_oauth$/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function shortenValue(value: string) {
  if (value.length <= 18) return value
  return `${value.slice(0, 6)}...${value.slice(-6)}`
}
