export const ROUTE_SEGMENTS = {
  login: 'login',
  tokenize: 'tokenize',
  orders: 'orders',
  tokens: 'tokens',
  marketplace: 'marketplace',
} as const

export const ROUTE_PATHS = {
  home: '/',
  login: `/${ROUTE_SEGMENTS.login}`,
  tokenize: `/${ROUTE_SEGMENTS.tokenize}`,
  orders: `/${ROUTE_SEGMENTS.orders}`,
  tokens: `/${ROUTE_SEGMENTS.tokens}`,
  marketplace: `/${ROUTE_SEGMENTS.marketplace}`,
} as const
