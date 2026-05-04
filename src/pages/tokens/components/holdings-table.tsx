import { ExternalLink, Wallet } from 'lucide-react'
import {
  formatVintageTokenAmount,
  getSolscanTokenUrl,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { SOLSCAN_CLUSTER } from '@/shared/constants/solana'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '@/pages/marketplace/lib/listing-meta'
import { EmptyState, ErrorState } from '@/shared/ui/state-message'

const USDC_DECIMALS = 1_000_000

export type HoldingRow = {
  vintageMint: string
  token: VintageToken | null
  heldAmount: number
  listings: Array<{
    publicKey: string
    amountToSell: string
    unitPrice: string
  }>
}

type HoldingsTableProps = {
  rows: HoldingRow[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  connected: boolean
  ownerAddress: string | null
  onConnectWallet: () => void
  onRetire: (token: VintageToken) => void
  onList: (token: VintageToken) => void
  onManageListing: (listingPublicKey: string) => void
  disabled?: boolean
}

export function HoldingsTable({
  rows,
  isLoading,
  isError,
  errorMessage,
  connected,
  ownerAddress,
  onConnectWallet,
  onRetire,
  onList,
  onManageListing,
  disabled,
}: HoldingsTableProps) {
  if (!ownerAddress && !connected) {
    return (
      <EmptyState
        icon={<Wallet className="size-5" />}
        title="Connect a wallet"
        description="Connect your Solana wallet to see the carbon credits you hold."
        action={
          <button
            type="button"
            onClick={onConnectWallet}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Connect wallet
          </button>
        }
      />
    )
  }

  if (isLoading) {
    return <HoldingsSkeleton />
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn’t load holdings"
        description={errorMessage ?? 'Try refreshing in a moment.'}
      />
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No credits yet"
        description="Carbon credits you buy or import will appear here. Browse the Marketplace to make your first purchase."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="grid grid-cols-[minmax(0,1.5fr)_110px_minmax(0,170px)_minmax(0,260px)] items-center gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Project</div>
        <div className="text-right">Held</div>
        <div className="text-right">Listed</div>
        <div className="text-right">Actions</div>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((row) => {
          const projectName = formatProjectName(
            row.token,
            row.token?.symbol ?? 'Carbon credit'
          )
          const type = detectProjectType(row.token?.name)
          const vintage = extractVintage(row.token?.name)
          const held = row.token ? formatVintageTokenAmount(row.token) : String(row.heldAmount)
          const listedAmount = row.listings.reduce(
            (sum, listing) => sum + Number(listing.amountToSell || '0'),
            0
          )
          const avgPrice =
            listedAmount > 0
              ? row.listings.reduce(
                  (sum, listing) =>
                    sum + (Number(listing.unitPrice) / USDC_DECIMALS) * Number(listing.amountToSell),
                  0
                ) / listedAmount
              : 0

          const hasHeld = row.heldAmount > 0
          const hasListings = row.listings.length > 0

          return (
            <li
              key={row.vintageMint}
              className="grid grid-cols-[minmax(0,1.5fr)_110px_minmax(0,170px)_minmax(0,260px)] items-center gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {projectName}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {type}
                  </span>
                  {vintage ? <span>Vintage {vintage}</span> : null}
                  <span className="text-border-strong">·</span>
                  <a
                    href={getSolscanTokenUrl(row.vintageMint, SOLSCAN_CLUSTER)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    On chain
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              <div className="num text-right text-sm font-semibold text-foreground">
                {hasHeld ? (
                  <>
                    {held}
                    <span className="text-xs font-normal text-muted-foreground"> credits</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>

              <div className="text-right">
                {hasListings ? (
                  <>
                    <div className="num text-sm font-semibold text-foreground">
                      {listedAmount.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground"> credits</span>
                    </div>
                    <div className="num text-[11px] text-muted-foreground">
                      avg ${avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </>
                ) : (
                  <span className="num text-sm text-muted-foreground">—</span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                {hasHeld && row.token && (
                  <>
                    <button
                      type="button"
                      onClick={() => row.token && onRetire(row.token)}
                      disabled={disabled}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      Retire
                    </button>
                    <button
                      type="button"
                      onClick={() => row.token && onList(row.token)}
                      disabled={disabled}
                      className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      {hasListings ? 'List more' : 'List'}
                    </button>
                  </>
                )}
                {hasListings && (
                  <button
                    type="button"
                    onClick={() => onManageListing(row.listings[0].publicKey)}
                    disabled={disabled}
                    className="rounded-md border border-border-strong px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Manage listing
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function HoldingsSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card animate-pulse">
      <div className="grid grid-cols-[minmax(0,1.5fr)_110px_minmax(0,170px)_minmax(0,260px)] gap-4 border-b border-border px-5 py-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-3 w-16 rounded bg-muted" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1.5fr)_110px_minmax(0,170px)_minmax(0,260px)] items-center gap-4 px-5 py-4"
          >
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="ml-auto h-4 w-20 rounded bg-muted" />
            <div className="ml-auto h-4 w-20 rounded bg-muted" />
            <div className="ml-auto h-7 w-56 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}
