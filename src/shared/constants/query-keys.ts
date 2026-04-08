export const QUERY_KEYS = {
  PURO_ACCOUNT: ['puro-account'] as const,
  ORDERS_GROUPED: ['orders', 'grouped'] as const,
  MARKETPLACE_LISTINGS: ['marketplace', 'listings'] as const,
  ONRAMPER_DEFAULTS: (walletAddress?: string) =>
    ['onramper', 'defaults', walletAddress ?? null] as const,
  ONRAMPER_PAYMENT_TYPES: (params: {
    sourceCurrency?: string
    destinationCurrency?: string
    countryCode?: string
  }) =>
    [
      'onramper',
      'payment-types',
      params.sourceCurrency ?? null,
      params.destinationCurrency ?? null,
      params.countryCode ?? null,
    ] as const,
  USDC_BALANCE: (walletAddress?: string) =>
    ['solana', 'usdc-balance', walletAddress ?? null] as const,
} as const
