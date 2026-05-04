import {
  DEMO_CHECKOUT_INTENT,
  DEMO_ONRAMPER_DEFAULTS,
  DEMO_ONRAMPER_PAYMENT_METHODS,
  DEMO_ONRAMPER_QUOTES,
} from '@/shared/api/demo-responses'
import { apiClient } from '@/shared/api/client'
import { DEMO_MODE } from '@/shared/config/demo-mode'
import {
  OnramperCheckoutIntentSchema,
  OnramperDefaultsSchema,
  OnramperPaymentMethodsSchema,
  OnramperQuotesSchema,
} from './schemas'
import type {
  CreateOnramperCheckoutInput,
  OnramperCheckoutIntent,
  OnramperDefaults,
  OnramperPaymentMethods,
  OnramperQuotes,
} from './types'

export async function fetchOnramperDefaults(
  walletAddress: string
): Promise<OnramperDefaults> {
  if (DEMO_MODE) {
    return OnramperDefaultsSchema.parse(DEMO_ONRAMPER_DEFAULTS)
  }

  const response = await apiClient.get('/onramp/defaults', {
    params: { walletAddress },
  })

  return OnramperDefaultsSchema.parse(response.data)
}

export async function fetchOnramperPaymentMethods(params: {
  sourceCurrency: string
  destinationCurrency: string
  countryCode: string
}): Promise<OnramperPaymentMethods> {
  if (DEMO_MODE) {
    return OnramperPaymentMethodsSchema.parse(DEMO_ONRAMPER_PAYMENT_METHODS)
  }

  const response = await apiClient.get('/onramp/payment-types', {
    params,
  })

  return OnramperPaymentMethodsSchema.parse(response.data)
}

export async function fetchOnramperQuotes(params: {
  walletAddress: string
  sourceCurrency: string
  destinationCurrency: string
  fiatAmount: number
  countryCode: string
  paymentMethod?: string
}): Promise<OnramperQuotes> {
  if (DEMO_MODE) {
    return OnramperQuotesSchema.parse({
      quotes: DEMO_ONRAMPER_QUOTES.quotes.map((quote) => ({
        ...quote,
        fiatAmount: params.fiatAmount,
        paymentMethod: params.paymentMethod ?? quote.paymentMethod,
        cryptoAmount: Number((params.fiatAmount * (quote.rate ?? 1)).toFixed(2)),
        feeAmount:
          typeof quote.feeAmount === 'number'
            ? Number((params.fiatAmount - params.fiatAmount * (quote.rate ?? 1)).toFixed(2))
            : null,
      })),
    })
  }

  const response = await apiClient.get('/onramp/quotes', {
    params,
  })

  return OnramperQuotesSchema.parse(response.data)
}

export async function createOnramperCheckoutIntent(
  input: CreateOnramperCheckoutInput
): Promise<OnramperCheckoutIntent> {
  if (DEMO_MODE) {
    return OnramperCheckoutIntentSchema.parse(DEMO_CHECKOUT_INTENT)
  }

  const response = await apiClient.post('/onramp/checkout-intent', input)
  return OnramperCheckoutIntentSchema.parse(response.data)
}
