import { apiClient } from '@/shared/api/client'
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
  const response = await apiClient.get('/onramp/quotes', {
    params,
  })

  return OnramperQuotesSchema.parse(response.data)
}

export async function createOnramperCheckoutIntent(
  input: CreateOnramperCheckoutInput
): Promise<OnramperCheckoutIntent> {
  const response = await apiClient.post('/onramp/checkout-intent', input)
  return OnramperCheckoutIntentSchema.parse(response.data)
}
