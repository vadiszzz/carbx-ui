export type OnramperDefaults = {
  countryCode: string
  fiatCurrency: string
  fiatAmount: number
  destinationCurrency: string
  paymentMethod: string | null
  availableFiatCurrencies: string[]
}

export type OnramperPaymentMethod = {
  id: string
  label: string
  description: string | null
}

export type OnramperPaymentMethods = {
  paymentMethods: OnramperPaymentMethod[]
}

export type OnramperQuote = {
  id: string
  provider: string
  paymentMethod: string
  fiatAmount: number
  fiatCurrency: string
  cryptoAmount: number
  cryptoCurrency: string
  network: string | null
  feeAmount: number | null
  feeCurrency: string | null
  rate: number | null
  badges: string[]
  estimatedMinutes: number | null
  isBestValue: boolean
}

export type OnramperQuotes = {
  quotes: OnramperQuote[]
}

export type CreateOnramperCheckoutInput = {
  walletAddress: string
  quoteId: string
  sourceCurrency: string
  destinationCurrency: string
  fiatAmount: number
  paymentMethod: string
  countryCode: string
  redirectUrl?: string
}

export type OnramperCheckoutIntent = {
  checkoutUrl: string
  transactionId: string | null
  expiresAt: string | null
}
