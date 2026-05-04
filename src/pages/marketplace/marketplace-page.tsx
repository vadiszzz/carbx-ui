import { useMemo } from 'react'
import { RotateCw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Connection } from '@solana/web3.js'
import { qist_puro } from 'qist-puro-sdk'
import { AccountId } from 'qist-puro-sdk/lib/qist-puro/functions/getters/getSpecificAccounts'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { listingDetailPath } from '@/app/router/route-paths'
import { RPC_URL } from '@/shared/constants/solana'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import {
  formatSolanaAddressShort,
  getVintageTokensByMints,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { EmptyState, ErrorState } from '@/shared/ui/state-message'
import { ListingCard } from './components/listing-card'
import { MOCK_LISTINGS, MOCK_LOCATIONS, MOCK_TOKENS } from './lib/mock-listings'

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

const USDC_DECIMALS = 1_000_000
const MOCK_AUTH = import.meta.env.VITE_DEV_MOCK_AUTH === 'true'

function formatPrice(unitPrice: string) {
  const asNumber = Number(unitPrice)
  if (!Number.isFinite(asNumber)) return unitPrice
  return (asNumber / USDC_DECIMALS).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

async function fetchMarketplaceListings(): Promise<ListingAccount[]> {
  if (MOCK_AUTH) return MOCK_LISTINGS

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
  const { walletAddress } = usePrivyAuth()
  const navigate = useNavigate()

  const listingsQuery = useQuery<ListingAccount[], Error>({
    queryKey: QUERY_KEYS.MARKETPLACE_LISTINGS,
    queryFn: fetchMarketplaceListings,
  })

  const tokenMetadataQuery = useQuery<VintageToken[], Error>({
    queryKey: [
      ...QUERY_KEYS.MARKETPLACE_LISTINGS,
      'tokens',
      listingsQuery.data?.map((item) => item.vintageMint).join(',') ?? '',
    ],
    queryFn: () => {
      if (MOCK_AUTH) return Promise.resolve(MOCK_TOKENS)

      return getVintageTokensByMints({
        mints: (listingsQuery.data ?? []).map((item) => item.vintageMint),
        rpcUrl: RPC_URL,
      })
    },
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
      .sort(
        (first, second) =>
          Number(second.listing.createdAt) - Number(first.listing.createdAt)
      )
  }, [listingsQuery.data, tokenMetadataQuery.data])

  const isFetching = listingsQuery.isFetching || tokenMetadataQuery.isFetching
  const isLoading =
    listingsQuery.isLoading ||
    (Boolean(listingsQuery.data) && !tokenMetadataQuery.data && tokenMetadataQuery.isFetching)

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Marketplace</h1>
        <p className="max-w-xl text-muted-foreground">
          Buy verified carbon removal credits from on-chain listings. Hold in
          your wallet, retire when ready.
        </p>
      </header>

      <div className="flex items-center justify-between gap-3">
        <span className="num text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'project' : 'projects'} available
        </span>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            void listingsQuery.refetch()
            void tokenMetadataQuery.refetch()
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <RotateCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Updating' : 'Update'}
        </button>
      </div>

      {isLoading ? (
        <ListingsSkeleton />
      ) : listingsQuery.isError ? (
        <ErrorState
          title="Couldn’t load listings"
          description={listingsQuery.error.message}
          onRetry={() => {
            void listingsQuery.refetch()
            void tokenMetadataQuery.refetch()
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No active listings"
          description="Check back soon — sellers list new projects regularly."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {rows.map(({ listing, token }) => {
            const isMine = Boolean(walletAddress && listing.user === walletAddress)
            const location = MOCK_AUTH ? MOCK_LOCATIONS[listing.vintageMint] ?? null : null

            return (
              <ListingCard
                key={listing.publicKey}
                amountAvailable={listing.amountToSell}
                unitPrice={formatPrice(listing.unitPrice)}
                token={token}
                fallbackName={formatSolanaAddressShort(listing.vintageMint)}
                location={location}
                isMine={isMine}
                onView={() => navigate(listingDetailPath(listing.publicKey))}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}

function ListingsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card shadow-card overflow-hidden animate-pulse"
        >
          <div className="aspect-[4/3] bg-muted" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-8 w-full rounded bg-muted" />
            <div className="h-7 w-full rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

