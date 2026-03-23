import { useMemo, useState } from 'react'
import { ExternalLink, RotateCw, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { qist_puro } from 'qist-puro-sdk'
import { AccountId } from 'qist-puro-sdk/lib/qist-puro/functions/getters/getSpecificAccounts'
import { fetchSponsoredTransaction } from '@/shared/api/sponsored-transaction/requests'
import { SPONSORED_TX_TYPES } from '@/shared/api/sponsored-transaction/types'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import {
  RPC_URL,
  SOLSCAN_CLUSTER,
  SOLANA_CHAIN,
} from '@/shared/constants/solana'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import {
  base64ToBytes,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import {
  formatSolanaAddressShort,
  getSolscanTokenUrl,
  getVintageTokensByMints,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/toast-provider'
import { PageHeader } from '@/shared/ui/page-header'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { BuyListingDialog } from './components/buy-listing-dialog'

type ListingAccount = {
  publicKey: string
  user: string
  vintageMint: string
  registry: string
  rentPayer: string
  paymentMint: string
  amountToSell: string
  unitPrice: string
  createdAt: string
}

type MarketplaceRow = {
  listing: ListingAccount
  token: VintageToken | null
}

type MarketplaceView = 'all' | 'mine'

const USDC_DECIMALS = 1_000_000

function formatPrice(unitPrice: string) {
  const asNumber = Number(unitPrice)
  if (!Number.isFinite(asNumber)) return unitPrice
  return (asNumber / USDC_DECIMALS).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

function formatUnixTimestamp(value: string) {
  const asNumber = Number(value)
  if (!Number.isFinite(asNumber)) return value
  return new Date(asNumber * 1000).toLocaleString()
}

async function fetchMarketplaceListings(): Promise<ListingAccount[]> {
  const connection = new Connection(RPC_URL, 'confirmed')
  const rawAccounts = await qist_puro.functions.getters.getSpecificAccounts(
    AccountId.Listing,
    connection
  )

  return rawAccounts.map((rawAccount) => ({
    publicKey: String(rawAccount.publicKey),
    user: String(rawAccount.user),
    vintageMint: String(rawAccount.vintageMint),
    registry: String(rawAccount.registry),
    rentPayer: String(rawAccount.rentPayer),
    paymentMint: String(rawAccount.paymentMint),
    amountToSell: String(rawAccount.amountToSell),
    unitPrice: String(rawAccount.unitPrice),
    createdAt: String(rawAccount.createdAt),
  }))
}

export function MarketplacePage() {
  const { connectWallet } = usePrivy()
  const { connectedWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const { showToast, updateToast } = useToast()
  const connection = new Connection(RPC_URL, 'confirmed')
  const buyerPublicKey = walletAddress ? new PublicKey(walletAddress) : null
  const [buyListing, setBuyListing] = useState<ListingAccount | null>(null)
  const [buyAmount, setBuyAmount] = useState('')
  const [isBuying, setIsBuying] = useState(false)
  const [activeView, setActiveView] = useState<MarketplaceView>('all')

  const listingsQuery = useQuery<ListingAccount[], Error>({
    queryKey: QUERY_KEYS.MARKETPLACE_LISTINGS,
    queryFn: fetchMarketplaceListings,
  })

  const tokenMetadataQuery = useQuery<VintageToken[], Error>({
    queryKey: [...QUERY_KEYS.MARKETPLACE_LISTINGS, 'tokens', listingsQuery.data?.map((item) => item.vintageMint).join(',') ?? ''],
    queryFn: () =>
      getVintageTokensByMints({
        mints: (listingsQuery.data ?? []).map((item) => item.vintageMint),
        rpcUrl: RPC_URL,
      }),
    enabled:
      Boolean(listingsQuery.data) &&
      !listingsQuery.isError &&
      (listingsQuery.data?.length ?? 0) > 0,
  })

  const rows = useMemo<MarketplaceRow[]>(() => {
    const tokenByMint = new Map(
      (tokenMetadataQuery.data ?? []).map((token) => [token.mint, token])
    )

    return (listingsQuery.data ?? [])
      .map((listing) => ({
        listing,
        token: tokenByMint.get(listing.vintageMint) ?? null,
      }))
      .sort((first, second) => Number(second.listing.createdAt) - Number(first.listing.createdAt))
  }, [listingsQuery.data, tokenMetadataQuery.data])

  const selectedBuyToken =
    rows.find((row) => row.listing.publicKey === buyListing?.publicKey)?.token ?? null

  const filteredRows = useMemo(() => {
    if (activeView === 'mine') {
      if (!walletAddress) return []
      return rows.filter((row) => row.listing.user === walletAddress)
    }

    return rows
  }, [activeView, rows, walletAddress])

  async function handleBuySubmit() {
    if (!buyListing) return

    if (!buyerPublicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    if (!connectedWallet) {
      showToast({
        type: 'error',
        text: 'Connect your Solana wallet in Privy before buying',
        durationMs: 6000,
      })
      return
    }

    const amount = Number(buyAmount)
    if (!Number.isInteger(amount) || amount <= 0) {
      showToast({
        type: 'error',
        text: 'Amount must be a positive integer',
        durationMs: 5000,
      })
      return
    }

    const available = Number(buyListing.amountToSell)
    if (!Number.isFinite(available) || amount > available) {
      showToast({
        type: 'error',
        text: 'Amount exceeds available listing amount',
        durationMs: 5000,
      })
      return
    }

    setIsBuying(true)
    const toastId = showToast({
      type: 'info',
      text: 'Building buy transaction...',
    })

    try {
      const sponsoredTx = await fetchSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.BUY_VINTAGE_FROM_LISTING,
        userPubkey: buyerPublicKey.toBase58(),
        registry: buyListing.registry,
        listing: buyListing.publicKey,
        seller: buyListing.user,
        listingRentPayer: buyListing.rentPayer,
        amount,
      })

      if (sponsoredTx.errorMessage) {
        throw new Error(sponsoredTx.errorMessage)
      }

      if (!sponsoredTx.tx) {
        throw new Error('Sponsored transaction payload is empty')
      }

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })

      const signatureResult = await signAndSendTransaction({
        transaction: base64ToBytes(sponsoredTx.tx),
        wallet: connectedWallet,
        chain: SOLANA_CHAIN,
        options: {
          skipPreflight: true,
        },
      })

      const signature = bs58.encode(signatureResult.signature)
      await waitForTransactionConfirmation(connection, signature)

      updateToast(toastId, {
        type: 'success',
        text: 'Buy transaction confirmed',
        signature,
        durationMs: 6000,
      })

      setBuyListing(null)
      setBuyAmount('')
      await listingsQuery.refetch()
      await tokenMetadataQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Buy failed'
      updateToast(toastId, {
        type: 'error',
        text: message,
        durationMs: 7000,
      })
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <section className="grid gap-5">
      <PageHeader
        description="Browse live on-chain listings, compare sellers and pricing, and execute buys through the sponsored transaction flow."
        kicker={
          <div className="page-kicker">
            <ShoppingBag className="size-3.5" />
            Secondary market
          </div>
        }
        title="Marketplace"
      />

      <Card>
        <CardHeader>
          <CardTitle>Listed CORCs</CardTitle>
          <CardDescription>
            Live listings loaded from on-chain accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  activeView === 'all'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950',
                ].join(' ')}
                onClick={() => setActiveView('all')}
                type="button"
              >
                All listings
              </button>
              <button
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  activeView === 'mine'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950',
                ].join(' ')}
                onClick={() => setActiveView('mine')}
                type="button"
              >
                My listings
              </button>
            </div>

            <div className="app-toolbar justify-end">
            {!connectedWallet ? (
              <Button
                onClick={() => connectWallet({ walletChainType: 'solana-only' })}
              >
                Connect wallet
              </Button>
            ) : null}
            <Button
              className="min-w-28"
              disabled={listingsQuery.isFetching || tokenMetadataQuery.isFetching}
              onClick={() => {
                void listingsQuery.refetch()
                void tokenMetadataQuery.refetch()
              }}
              variant="outline"
            >
              {listingsQuery.isFetching || tokenMetadataQuery.isFetching ? (
                <>
                  <RotateCw className="size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RotateCw className="size-4" />
                  Update
                </>
              )}
            </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listingsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    Loading marketplace listings...
                  </TableCell>
                </TableRow>
              ) : null}

              {listingsQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-destructive">
                    Failed to load marketplace listings: {listingsQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {!listingsQuery.isLoading &&
              !listingsQuery.isError &&
              filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {activeView === 'mine'
                      ? walletAddress
                        ? 'No listings found for this wallet.'
                        : 'Connect a wallet to view your listings.'
                      : 'No active listings found.'}
                  </TableCell>
                </TableRow>
              ) : null}

              {filteredRows.map(({ listing, token }) => (
                <TableRow key={listing.publicKey}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="grid gap-0.5">
                        <span className="font-medium">
                          {token?.name ?? token?.symbol ?? formatSolanaAddressShort(listing.vintageMint)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {token?.symbol ?? formatSolanaAddressShort(listing.vintageMint)}
                        </span>
                      </div>
                      <Button asChild size="xs" variant="ghost">
                        <a
                          href={getSolscanTokenUrl(listing.vintageMint, SOLSCAN_CLUSTER)}
                          rel="noreferrer"
                          target="_blank"
                          title="Open token in Solscan"
                        >
                          <ExternalLink className="size-3.5" />
                          <span className="sr-only">Open in Solscan</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{formatSolanaAddressShort(listing.user)}</TableCell>
                  <TableCell>{listing.amountToSell}</TableCell>
                  <TableCell>{formatPrice(listing.unitPrice)} USDC</TableCell>
                  <TableCell>{formatUnixTimestamp(listing.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    {walletAddress && listing.user === walletAddress ? (
                      <Button
                        onClick={() => {}}
                        size="sm"
                        variant="outline"
                      >
                        Close
                      </Button>
                    ) : (
                      <Button
                        disabled={isBuying}
                        onClick={() => {
                          setBuyListing(listing)
                          setBuyAmount(listing.amountToSell)
                        }}
                        size="sm"
                      >
                        Buy
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BuyListingDialog
        amount={buyAmount}
        formattedUnitPrice={buyListing ? formatPrice(buyListing.unitPrice) : '-'}
        isSubmitting={isBuying}
        listing={buyListing}
        onAmountChange={setBuyAmount}
        onClose={() => setBuyListing(null)}
        onSubmit={() => void handleBuySubmit()}
        token={selectedBuyToken}
      />
    </section>
  )
}
