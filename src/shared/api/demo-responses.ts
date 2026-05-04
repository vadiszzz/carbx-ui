import type { GroupedOrders } from '@/shared/api/orders/types'
import type { OnramperDefaults, OnramperPaymentMethods, OnramperQuotes } from '@/shared/api/onramper/types'
import type { PuroAccount } from '@/shared/api/puro/types'
import type { CreateRetireResponse } from '@/shared/api/retire/types'
import type { SponsoredTransactionResponse } from '@/shared/api/sponsored-transaction/types'

export const DEMO_PURO_ACCOUNT: PuroAccount = {
  wallet: '9RMPunW8iLiwxUMXXp8GKMZboX7urnJkwYTsn1xNSAYp',
  puroAccountNumber: '45724d88-8755-481b-851a-9a94df76b77f',
}

export const DEMO_ONRAMPER_DEFAULTS: OnramperDefaults = {
  countryCode: 'US',
  fiatCurrency: 'USD',
  fiatAmount: 100,
  destinationCurrency: 'USDC',
  paymentMethod: 'card',
  availableFiatCurrencies: ['USD', 'EUR', 'GBP'],
}

export const DEMO_ONRAMPER_PAYMENT_METHODS: OnramperPaymentMethods = {
  paymentMethods: [
    {
      id: 'card',
      label: 'Credit card',
      description: 'Fastest checkout for a live demo.',
    },
    {
      id: 'bank_transfer',
      label: 'Bank transfer',
      description: 'Lower fees, slower settlement.',
    },
    {
      id: 'apple_pay',
      label: 'Apple Pay',
      description: 'One-tap checkout on supported devices.',
    },
  ],
}

export const DEMO_ONRAMPER_QUOTES: OnramperQuotes = {
  quotes: [
    {
      id: 'demo-quote-moonpay',
      provider: 'MoonPay',
      paymentMethod: 'card',
      fiatAmount: 100,
      fiatCurrency: 'USD',
      cryptoAmount: 96.4,
      cryptoCurrency: 'USDC',
      network: 'Solana',
      feeAmount: 3.6,
      feeCurrency: 'USD',
      rate: 0.964,
      badges: ['Best value', 'Instant'],
      estimatedMinutes: 3,
      isBestValue: true,
    },
    {
      id: 'demo-quote-banxa',
      provider: 'Banxa',
      paymentMethod: 'bank_transfer',
      fiatAmount: 100,
      fiatCurrency: 'USD',
      cryptoAmount: 97.15,
      cryptoCurrency: 'USDC',
      network: 'Solana',
      feeAmount: 2.85,
      feeCurrency: 'USD',
      rate: 0.9715,
      badges: ['Low fee'],
      estimatedMinutes: 15,
      isBestValue: false,
    },
    {
      id: 'demo-quote-ramp',
      provider: 'Ramp',
      paymentMethod: 'apple_pay',
      fiatAmount: 100,
      fiatCurrency: 'USD',
      cryptoAmount: 95.9,
      cryptoCurrency: 'USDC',
      network: 'Solana',
      feeAmount: 4.1,
      feeCurrency: 'USD',
      rate: 0.959,
      badges: ['Mobile'],
      estimatedMinutes: 2,
      isBestValue: false,
    },
  ],
}

export const DEMO_CHECKOUT_INTENT = {
  checkoutUrl: 'about:blank',
  transactionId: 'demo-checkout-intent',
  expiresAt: null,
}

export const DEMO_GROUPED_ORDERS: GroupedOrders = [
  {
    puroIncomingTxId: 'PURO-IN-000184',
    status: 'completed',
    wallet: DEMO_PURO_ACCOUNT.wallet as string,
    puroAccountNumber: DEMO_PURO_ACCOUNT.puroAccountNumber,
    createdAt: '2026-05-01T10:30:00.000Z',
    updatedAt: '2026-05-01T10:42:00.000Z',
    items: [
      {
        orderId: 'demo-order-1',
        orderType: 'TOKENIZE',
        wallet: DEMO_PURO_ACCOUNT.wallet as string,
        puroAccountNumber: DEMO_PURO_ACCOUNT.puroAccountNumber,
        receivedAmount: 80,
        puroIncomingTxId: 'PURO-IN-000184',
        certificateId: 'PURO_PR_CORC100+_BR_24_AMZ_004',
        mintSignature: '5f3f1kDemoMintSignature11111111111111111111',
        puroInternalTransferTxId: 'PURO-MOVE-881',
        errorMessage: null,
        vintage: 2024,
        methodologyName: 'Forestation',
        status: 'completed',
        expiresAt: null,
        createdAt: '2026-05-01T10:30:00.000Z',
        updatedAt: '2026-05-01T10:42:00.000Z',
      },
    ],
  },
]

export const DEMO_RETIRE_RESPONSE: CreateRetireResponse = {
  carbxRetireUuid: 'demo-retire-uuid',
}

export const DEMO_SPONSORED_TX_RESPONSE: SponsoredTransactionResponse = {
  tx: '',
  errorMessage: 'Demo mode: blockchain transactions are disabled.',
}
