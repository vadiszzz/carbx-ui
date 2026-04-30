export const ROUTE_SEGMENTS = {
  login: 'login',
  marketplace: 'marketplace',
  marketplaceListing: 'marketplace/:listingPublicKey',
  portfolio: 'portfolio',
  portfolioHoldings: 'holdings',
  portfolioDeposit: 'deposit',
  portfolioWithdraw: 'withdraw',
  portfolioActivity: 'activity',
  account: 'account',
} as const

export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  marketplace: '/marketplace',
  portfolio: '/portfolio',
  portfolioHoldings: '/portfolio/holdings',
  portfolioDeposit: '/portfolio/deposit',
  portfolioWithdraw: '/portfolio/withdraw',
  portfolioActivity: '/portfolio/activity',
  account: '/account',
} as const

export function listingDetailPath(listingPublicKey: string): string {
  return `/marketplace/${listingPublicKey}`
}
