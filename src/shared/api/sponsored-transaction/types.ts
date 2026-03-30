import { z } from 'zod'

export const SPONSORED_TX_TYPES = {
  LIST_VINTAGE: 'listVintage',
  EDIT_LISTING: 'editListing',
  BUY_VINTAGE_FROM_LISTING: 'buyVintageFromListing',
  RETIRE_VINTAGE: 'retireVintage',
  BURN_VINTAGE: 'burnVintage',
  TRANSFER_TOKEN: 'transferToken',
} as const

export const SponsoredTxTypeSchema = z.enum([
  SPONSORED_TX_TYPES.LIST_VINTAGE,
  SPONSORED_TX_TYPES.EDIT_LISTING,
  SPONSORED_TX_TYPES.BUY_VINTAGE_FROM_LISTING,
  SPONSORED_TX_TYPES.RETIRE_VINTAGE,
  SPONSORED_TX_TYPES.BURN_VINTAGE,
  SPONSORED_TX_TYPES.TRANSFER_TOKEN,
])

export type SponsoredTxType = z.infer<typeof SponsoredTxTypeSchema>

export type SponsoredTransactionParams = {
  txType: SponsoredTxType
  user?: string
  userPubkey?: string
  registry?: string
  amount: number
  carbxRetireUuid?: string
  price?: number
  listing?: string
  seller?: string
  listingRentPayer?: string
  puroUserUuid?: string
  tokenMint?: string
  recipient?: string
}

export type SponsoredTransactionResponse = {
  tx: string
  errorMessage?: string
}
