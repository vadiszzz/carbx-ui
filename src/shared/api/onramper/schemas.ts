import { z } from 'zod'

export const OnramperDefaultsSchema = z.object({
  countryCode: z.string().min(2),
  fiatCurrency: z.string().min(1),
  fiatAmount: z.number().positive(),
  destinationCurrency: z.string().min(1),
  paymentMethod: z.string().min(1).nullable(),
  availableFiatCurrencies: z.array(z.string().min(1)),
})

export const OnramperPaymentMethodSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1).nullable(),
})

export const OnramperPaymentMethodsSchema = z.object({
  paymentMethods: z.array(OnramperPaymentMethodSchema),
})

export const OnramperQuoteSchema = z.object({
  id: z.string().min(1),
  provider: z.string().min(1),
  paymentMethod: z.string().min(1),
  fiatAmount: z.number().positive(),
  fiatCurrency: z.string().min(1),
  cryptoAmount: z.number().positive(),
  cryptoCurrency: z.string().min(1),
  network: z.string().min(1).nullable(),
  feeAmount: z.number().nonnegative().nullable(),
  feeCurrency: z.string().min(1).nullable(),
  rate: z.number().positive().nullable(),
  badges: z.array(z.string().min(1)),
  estimatedMinutes: z.number().int().positive().nullable(),
  isBestValue: z.boolean(),
})

export const OnramperQuotesSchema = z.object({
  quotes: z.array(OnramperQuoteSchema),
})

export const OnramperCheckoutIntentSchema = z.object({
  checkoutUrl: z.string().url(),
  transactionId: z.string().min(1).nullable(),
  expiresAt: z.string().min(1).nullable(),
})
