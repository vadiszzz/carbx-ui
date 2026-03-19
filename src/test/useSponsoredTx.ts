import { useCallback } from 'react';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { PublicKey, VersionedTransaction, Connection } from '@solana/web3.js';
import { EMPTY_PUBKEY } from 'qist-puro-sdk/lib/qist-puro/constants';
import { fetchSponsoredTx } from './requests';
import type { SponsoredTxRequestOptions } from './types';
import { TxType } from './types';

export function base64ToU8a(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function useSponsoredTx() {
  const walletCtx = useEmbeddedSolanaWallet();
  const embeddedWallet = walletCtx?.wallets?.[0];

  const sendSponsoredTx = useCallback(
    async (
      txType: TxType,
      userPubkey: PublicKey,
      connection: Connection,
      {
        registry = EMPTY_PUBKEY.toString(),
        amount = 0,
        price,
        listing,
        seller,
        listingRentPayer,
        puroUserUuid,
      }: Partial<SponsoredTxRequestOptions> = {},
    ) => {
      if (!embeddedWallet) throw new Error('No embedded wallet found');

      const data = await fetchSponsoredTx({
        txType,
        user: userPubkey.toString(),
        registry,
        amount,
        price,
        listing,
        seller,
        listingRentPayer,
        puroUserUuid,
      });
      if (data.errorMessage) throw new Error(`Got error trying to sign tx: ${data.errorMessage}`);
      const provider = await embeddedWallet.getProvider();

      const vtx = VersionedTransaction.deserialize(base64ToU8a(data.tx));

      const maxRetries = 3;
      let attempt = 0;

      while (attempt < maxRetries) {
        try {
          const signature = await provider.request({
            method: 'signAndSendTransaction',
            params: {
              transaction: vtx,
              connection,
              options: { skipPreflight: true, maxRetries: 3 },
            },
          });

          return signature.signature;
        } catch (err: any) {
          attempt++;
          if (err?.message?.includes('Network request failed')) {
            if (attempt < maxRetries) {
              await new Promise((res) => setTimeout(res, 500));
              continue;
            }
          }
          throw err;
        }
      }
    },
    [embeddedWallet],
  );

  return { sendSponsoredTx, hasWallet: !!embeddedWallet };
}
