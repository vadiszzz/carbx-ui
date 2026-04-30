import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Loader2, MapPin, Minus, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { Connection } from '@solana/web3.js'
import bs58 from 'bs58'
import { qist_puro } from 'qist-puro-sdk'
import { AccountId } from 'qist-puro-sdk/lib/qist-puro/functions/getters/getSpecificAccounts'
import { fetchSponsoredTransaction } from '@/shared/api/sponsored-transaction/requests'
import { SPONSORED_TX_TYPES } from '@/shared/api/sponsored-transaction/types'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import {
  RPC_URL,
  SOLANA_CHAIN,
  SOLSCAN_CLUSTER,
} from '@/shared/constants/solana'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import {
  base64ToBytes,
  parseLocalizedNumber,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import {
  formatSolanaAddressShort,
  getSolscanTokenUrl,
  getVintageTokensByMints,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { useToast } from '@/shared/ui/toast-provider'
import { EmptyState, ErrorState } from '@/shared/ui/state-message'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
  gradientForType,
} from './lib/listing-meta'
import {
  MOCK_LISTINGS,
  MOCK_LOCATIONS,
  MOCK_PROJECT_DETAILS,
  MOCK_TOKENS,
} from './lib/mock-listings'

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

const USDC_DECIMALS = 1_000_000
const FEE_RATE = 0.025
const QUICK_FRACTIONS = [0.25, 0.5, 0.75, 1] as const
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

export function ListingDetailPage() {
  const { listingPublicKey } = useParams<{ listingPublicKey: string }>()
  const navigate = useNavigate()
  const { connectWallet } = usePrivy()
  const { connectedWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const { showToast, updateToast } = useToast()
  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), [])

  const [amount, setAmount] = useState('100')
  const [isBuying, setIsBuying] = useState(false)

  const listingsQuery = useQuery<ListingAccount[], Error>({
    queryKey: QUERY_KEYS.MARKETPLACE_LISTINGS,
    queryFn: fetchMarketplaceListings,
  })

  const listing = useMemo(
    () => listingsQuery.data?.find((row) => row.publicKey === listingPublicKey) ?? null,
    [listingsQuery.data, listingPublicKey]
  )

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

  const token = useMemo(
    () =>
      tokenMetadataQuery.data?.find((entry) => entry.mint === listing?.vintageMint) ?? null,
    [tokenMetadataQuery.data, listing]
  )

  if (listingsQuery.isLoading) {
    return <DetailSkeleton />
  }

  if (listingsQuery.isError) {
    return (
      <ErrorState
        title="Couldn’t load listing"
        description={listingsQuery.error.message}
        onRetry={() => void listingsQuery.refetch()}
      />
    )
  }

  if (!listing) {
    return (
      <EmptyState
        title="Listing not found"
        description="This listing may have been closed or completed. Browse the marketplace for active listings."
        action={
          <Link
            to={ROUTE_PATHS.marketplace}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            Browse marketplace
          </Link>
        }
      />
    )
  }

  const projectName = formatProjectName(token, formatSolanaAddressShort(listing.vintageMint))
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name)
  const gradient = gradientForType(type)
  const location = MOCK_AUTH ? MOCK_LOCATIONS[listing.vintageMint] ?? null : null
  const detail = MOCK_AUTH ? MOCK_PROJECT_DETAILS[listing.vintageMint] ?? null : null
  const isMine = Boolean(walletAddress && listing.user === walletAddress)
  const formattedPrice = formatPrice(listing.unitPrice)

  const unitPriceNum = Number(formattedPrice.replace(/,/g, ''))
  const amountNum = parseAmount(amount)
  const available = Number(listing.amountToSell)
  const subtotal = unitPriceNum * amountNum
  const fee = subtotal * FEE_RATE
  const total = subtotal + fee
  const aboveAvailable = amountNum > available

  function adjust(delta: number) {
    const next = Math.max(0, amountNum + delta)
    setAmount(String(next))
  }

  async function handleBuySubmit() {
    if (!listing) return

    if (MOCK_AUTH) {
      showToast({
        type: 'info',
        text: 'Mock mode: real buy disabled. Wire backend to enable.',
        durationMs: 4000,
      })
      return
    }

    if (!connectedWallet || !walletAddress) {
      showToast({
        type: 'error',
        text: 'Connect your Solana wallet in Privy before buying',
        durationMs: 6000,
      })
      return
    }

    let parsedAmount: number
    try {
      parsedAmount = parseLocalizedNumber(amount)
    } catch {
      parsedAmount = Number.NaN
    }
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
      showToast({
        type: 'error',
        text: 'Amount must be a positive integer',
        durationMs: 5000,
      })
      return
    }

    if (parsedAmount > available) {
      showToast({
        type: 'error',
        text: 'Amount exceeds available listing amount',
        durationMs: 5000,
      })
      return
    }

    setIsBuying(true)
    const toastId = showToast({ type: 'info', text: 'Building buy transaction...' })

    try {
      const sponsoredTx = await fetchSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.BUY_VINTAGE_FROM_LISTING,
        user: walletAddress,
        registry: listing.registry,
        listing: listing.publicKey,
        seller: listing.user,
        listingRentPayer: listing.rentPayer,
        amount: parsedAmount,
      })

      if (sponsoredTx.errorMessage) throw new Error(sponsoredTx.errorMessage)
      if (!sponsoredTx.tx) throw new Error('Sponsored transaction payload is empty')

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })

      const signatureResult = await signAndSendTransaction({
        transaction: base64ToBytes(sponsoredTx.tx),
        wallet: connectedWallet,
        chain: SOLANA_CHAIN,
        options: { skipPreflight: true },
      })

      const signature = bs58.encode(signatureResult.signature)
      await waitForTransactionConfirmation(connection, signature)

      updateToast(toastId, {
        type: 'success',
        text: 'Buy transaction confirmed',
        signature,
        durationMs: 6000,
      })

      await listingsQuery.refetch()
      navigate(ROUTE_PATHS.portfolioHoldings)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Buy failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        to={ROUTE_PATHS.marketplace}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Marketplace
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-8">
          <div
            className="relative aspect-[16/8] w-full overflow-hidden rounded-xl"
            style={{ background: gradient }}
          >
            <span className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-1 text-xs font-semibold text-foreground">
              {type}
            </span>
            {isMine && (
              <span className="absolute right-4 top-4 rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Your listing
              </span>
            )}
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {projectName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {location}
                </span>
              )}
              {vintage && <span>· Vintage {vintage}</span>}
              <span>· Puro Registry</span>
            </div>
          </div>

          {detail?.description && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                About this project
              </h2>
              <p className="leading-relaxed text-muted-foreground">{detail.description}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Project details
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl bg-card p-6 shadow-card sm:grid-cols-2">
              <DetailRow
                label="Methodology"
                value={detail?.methodology ?? 'Puro Standard'}
              />
              <DetailRow label="Vintage" value={vintage ?? '—'} />
              {detail?.developer && (
                <DetailRow label="Project developer" value={detail.developer} />
              )}
              {detail?.projectStart && (
                <DetailRow label="Project start" value={detail.projectStart} />
              )}
              <DetailRow label="Registry" value="Puro" />
              <DetailRow
                label="Total available"
                value={`${Number(listing.amountToSell).toLocaleString()} credits`}
              />
            </dl>
          </section>

          {(detail?.certificateId || listing.vintageMint) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Verification
              </h2>
              <dl className="space-y-3 rounded-xl bg-card p-6 shadow-card text-sm">
                {detail?.certificateId && (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-muted-foreground">Certificate ID</dt>
                    <dd className="num font-medium text-foreground break-all">
                      {detail.certificateId}
                    </dd>
                  </div>
                )}
                {detail?.puroUrl && (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <dt className="text-muted-foreground">Puro Registry</dt>
                    <dd>
                      <a
                        href={detail.puroUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        View on Puro Registry
                        <ExternalLink className="size-3.5" />
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">On-chain token</dt>
                  <dd>
                    <a
                      href={getSolscanTokenUrl(listing.vintageMint, SOLSCAN_CLUSTER)}
                      target="_blank"
                      rel="noreferrer"
                      className="num inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {formatSolanaAddressShort(listing.vintageMint)}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl bg-card p-6 shadow-card">
            <div className="flex items-baseline gap-2">
              <span className="num text-3xl font-bold text-foreground">
                ${formattedPrice}
              </span>
              <span className="text-sm text-muted-foreground">per credit</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground num">
              {Number(listing.amountToSell).toLocaleString()} credits available
            </p>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </label>
              <div className="flex items-stretch overflow-hidden rounded-lg border border-border-strong">
                <button
                  type="button"
                  onClick={() => adjust(-1)}
                  disabled={isBuying}
                  className="flex items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={isBuying}
                  className="num flex-1 bg-transparent py-2.5 text-center text-base font-semibold text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjust(1)}
                  disabled={isBuying}
                  className="flex items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {QUICK_FRACTIONS.map((fraction) => {
                  const value = Math.floor(available * fraction)
                  const isMax = fraction === 1
                  return (
                    <button
                      key={fraction}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      disabled={isBuying || value <= 0}
                      className={[
                        'num rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-30',
                        isMax
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'border border-border text-foreground hover:bg-muted',
                      ].join(' ')}
                    >
                      {isMax ? 'Max' : `${Math.round(fraction * 100)}%`}
                    </button>
                  )
                })}
              </div>

              {aboveAvailable && (
                <p className="mt-2 text-xs text-destructive">
                  Only {available.toLocaleString()} credits available.
                </p>
              )}
            </div>

            <div className="mt-5 space-y-2 rounded-lg bg-muted p-4 text-sm">
              <Row label="Subtotal" value={`$${formatMoney(subtotal)}`} />
              <Row
                label={`Platform fee (${(FEE_RATE * 100).toFixed(1)}%)`}
                value={`$${formatMoney(fee)}`}
              />
              <div className="border-t border-border pt-2">
                <Row label="Total" value={`$${formatMoney(total)}`} bold />
              </div>
            </div>

            {isMine ? (
              <Link
                to={ROUTE_PATHS.portfolioHoldings}
                className="mt-5 block rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/70"
              >
                This is your own listing. Manage it in Portfolio &rsaquo;
              </Link>
            ) : !connectedWallet && !MOCK_AUTH ? (
              <button
                type="button"
                onClick={() => connectWallet({ walletChainType: 'solana-only' })}
                className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Connect wallet to buy
              </button>
            ) : (
              <button
                type="button"
                disabled={isBuying || amountNum <= 0 || aboveAvailable}
                onClick={() => void handleBuySubmit()}
                className="mt-5 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isBuying ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Processing
                  </span>
                ) : (
                  'Confirm purchase'
                )}
              </button>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Credits delivered to your wallet on confirmation. All sales final.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-foreground' : ''}`}>
      <span className={bold ? '' : 'text-muted-foreground'}>{label}</span>
      <span className="num">{value}</span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="aspect-[16/8] rounded-xl bg-muted" />
          <div className="space-y-3">
            <div className="h-9 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
          <div className="h-32 rounded-xl bg-muted" />
        </div>
        <div className="h-96 rounded-xl bg-muted" />
      </div>
    </div>
  )
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function formatMoney(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
