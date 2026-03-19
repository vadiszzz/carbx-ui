export enum TxType {
  ListVintage,
  EditListing,
  BuyVintageFromListing,
  RetireVintage,
  BurnVintage,
}

export type CreateSponsoredTransactionParams = {
  txType: TxType;
  user: string;
  registry: string;
  amount: number;
  price?: number;
  listing?: string;
  seller?: string;
  listingRentPayer?: string;
  puroUserUuid?: string;
};

export type SponsoredTxRequestOptions = Omit<
  CreateSponsoredTransactionParams,
  'txType' | 'user'
>;
