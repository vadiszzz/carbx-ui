export type ActivityEventType =
  | 'BUY'
  | 'SELL'
  | 'LIST'
  | 'EDIT_LIST'
  | 'CANCEL_LIST'
  | 'TOKENIZE'
  | 'RETIRE'
  | 'DETOKENIZE'

export type ActivityStatus = 'SUCCESS' | 'IN_PROGRESS' | 'ERROR'

export type ActivityEvent = {
  id: string
  type: ActivityEventType
  status: ActivityStatus
  timestamp: string
  vintageMint: string
  amount: number
  unitPriceUsdc?: number
  totalUsdc?: number
  counterparty?: string
  listingPublicKey?: string
  previousAmount?: number
  previousUnitPriceUsdc?: number
  txSignature?: string
  puroAccountNumber?: string
  puroIncomingTxId?: string
  certificateId?: string
  beneficiaryName?: string
  beneficiaryReason?: string
  errorMessage?: string
}

const AMAZON = 'MockMintAmazon11111111111111111111111111111'
const DAC = 'MockMintDAC1111111111111111111111111111111'
const SOIL = 'MockMintSoil1111111111111111111111111111111'
const BIOCHAR = 'MockMintBiochar11111111111111111111111111'

const BUYER_A = '7xAgB3kqFJ8tNvLm2eKpQrXyZ5wCdEfGhIjKlMnOpQrS'
const BUYER_B = '4nPqRsTuVwXyZ1aBcDeFgHiJkLmNoPqRsTuVwXyZ2bCd'
const SELLER_A = '6tQbVcWdEfGhIjKlMnOpQrStUvWxYz1aBcDeFgHiJkLm'

export const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: 'evt-buy-001',
    type: 'BUY',
    status: 'SUCCESS',
    timestamp: '2026-04-29T14:22:00Z',
    vintageMint: BIOCHAR,
    amount: 80,
    unitPriceUsdc: 95,
    totalUsdc: 7600,
    counterparty: SELLER_A,
    txSignature: '5Bx8VqK3nL9pRtYzWvUmCdFgHjKlMnPqStUvWxYzAbCdEfGhJkLmNpQrStVwXyZ',
  },
  {
    id: 'evt-tokenize-001',
    type: 'TOKENIZE',
    status: 'SUCCESS',
    timestamp: '2026-04-25T09:14:00Z',
    vintageMint: AMAZON,
    amount: 200,
    puroAccountNumber: 'PURO-CARBX-9RMP-4C2A',
    puroIncomingTxId: 'TX-PURO-2026-04-25-7741',
    certificateId: 'PURO_PR_CORC100+_BR_24_AMZ_004',
    txSignature: '3Kp7HnL2mQ8sTvWxYzAbCdEfGhJkLmNpQrStUvWxYzAbCdEfGhJkLmNpQrStVw',
  },
  {
    id: 'evt-list-001',
    type: 'LIST',
    status: 'SUCCESS',
    timestamp: '2026-04-22T16:45:00Z',
    vintageMint: SOIL,
    amount: 120,
    unitPriceUsdc: 16,
    listingPublicKey: 'mock-listing-soil',
    txSignature: '8Mn4RsTpQbVcWdEfGhIjKlMnOpQrStUvWxYz1aBcDeFgHiJkLmNoPqRsTuVwXy',
  },
  {
    id: 'evt-sell-001',
    type: 'SELL',
    status: 'SUCCESS',
    timestamp: '2026-04-19T11:08:00Z',
    vintageMint: DAC,
    amount: 15,
    unitPriceUsdc: 285,
    totalUsdc: 4275,
    counterparty: BUYER_A,
    txSignature: '2Hg9JkLmNoPqRsTuVwXyZ1aBcDeFgHiJkLmNoPqRsTuVwXyZ2bCdEfGhIjKlMn',
  },
  {
    id: 'evt-edit-001',
    type: 'EDIT_LIST',
    status: 'SUCCESS',
    timestamp: '2026-04-18T10:30:00Z',
    vintageMint: SOIL,
    amount: 120,
    unitPriceUsdc: 16,
    previousAmount: 150,
    previousUnitPriceUsdc: 14,
    listingPublicKey: 'mock-listing-soil',
    txSignature: '7Pq3WrTuVxYzAbCdEfGhJkLmNpQrStUvWxYzAbCdEfGhJkLmNpQrStVwXyZbH',
  },
  {
    id: 'evt-buy-002',
    type: 'BUY',
    status: 'IN_PROGRESS',
    timestamp: '2026-04-17T19:05:00Z',
    vintageMint: DAC,
    amount: 25,
    unitPriceUsdc: 285,
    totalUsdc: 7125,
    counterparty: BUYER_B,
  },
  {
    id: 'evt-retire-001',
    type: 'RETIRE',
    status: 'SUCCESS',
    timestamp: '2026-04-12T08:30:00Z',
    vintageMint: AMAZON,
    amount: 50,
    beneficiaryName: 'Qist Holdings Oy',
    beneficiaryReason: 'Q1 2026 corporate footprint offset',
    certificateId: 'PURO_PR_CORC100+_BR_24_AMZ_004',
    txSignature: '9Yz5BnCmDoEpFqGrHsItJuKvLwMxNyOzPaQbRcSdTeUfVgWhXiYjZkAlBmCnDoEp',
  },
  {
    id: 'evt-cancel-001',
    type: 'CANCEL_LIST',
    status: 'SUCCESS',
    timestamp: '2026-04-08T15:12:00Z',
    vintageMint: BIOCHAR,
    amount: 40,
    unitPriceUsdc: 92,
    listingPublicKey: 'mock-listing-biochar-old',
    txSignature: '1Ab6CnDoEpFqGrHsItJuKvLwMxNyOzPaQbRcSdTeUfVgWhXiYjZkAlBmCnDoEpFq',
  },
  {
    id: 'evt-tokenize-002',
    type: 'TOKENIZE',
    status: 'ERROR',
    timestamp: '2026-04-05T13:40:00Z',
    vintageMint: DAC,
    amount: 10,
    puroAccountNumber: 'PURO-CARBX-9RMP-4C2A',
    puroIncomingTxId: 'TX-PURO-2026-04-05-3210',
    errorMessage:
      'Puro registry returned status 409: certificate already tokenized in a prior order. Contact support if this is unexpected.',
  },
  {
    id: 'evt-detokenize-001',
    type: 'DETOKENIZE',
    status: 'SUCCESS',
    timestamp: '2026-03-28T12:00:00Z',
    vintageMint: AMAZON,
    amount: 20,
    puroAccountNumber: 'PURO-CARBX-9RMP-4C2A',
    txSignature: '4Cd8EnFoGpHqIrJsKtLuMvNwOxPyQzRaSbTcUdVeWfXgYhZiAjBkClDmEnFoGpHq',
  },
]
