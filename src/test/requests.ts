import axios from "axios";
import type { SponsoredTx } from "./requestsTypes";
import type { CreateSponsoredTransactionParams } from "./types";
import { TxType } from "./types";
import { SponsoredTxSchema } from "./schemas";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const fetchSponsoredTx = async (
  {
    txType,
    user,
    registry,
    amount,
    price,
    listing,
    seller,
    listingRentPayer,
    puroUserUuid,
  }: CreateSponsoredTransactionParams,
): Promise<SponsoredTx> => {
  const response = await axios.get(`${API_BASE_URL}/sponsored-transaction`, {
    params: {
      txType: TxType[txType],
      user,
      registry,
      amount,
      price,
      listing,
      seller,
      listingRentPayer,
      puroUserUuid,
    },
  });

  return SponsoredTxSchema.parse(response.data);
};
