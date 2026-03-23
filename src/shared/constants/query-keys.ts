export const QUERY_KEYS = {
  PURO_ACCOUNT: ['puro-account'] as const,
  ORDERS_GROUPED: ['orders', 'grouped'] as const,
  MARKETPLACE_LISTINGS: ['marketplace', 'listings'] as const,
  USDC_BALANCE: (walletAddress?: string) =>
    ['solana', 'usdc-balance', walletAddress ?? null] as const,
} as const
