import { useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { EmptyState as SharedEmptyState } from '@/shared/ui/state-message'
import { SOLSCAN_CLUSTER } from '@/shared/constants/solana'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '@/pages/marketplace/lib/listing-meta'
import { MOCK_TOKENS } from '@/pages/marketplace/lib/mock-listings'
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_DESCRIPTIONS,
  ACTIVITY_TYPE_LABELS,
  formatActivityDate,
  formatActivityDateTime,
  formatUsdc,
  getActivityStatusClass,
  getActivityTypeChipClass,
  shortAddress,
} from './lib/activity-meta'
import {
  MOCK_ACTIVITY,
  type ActivityEvent,
  type ActivityEventType,
} from './lib/mock-activity'

type FilterValue = 'ALL' | ActivityEventType

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BUY', label: 'Buys' },
  { value: 'SELL', label: 'Sales' },
  { value: 'LIST', label: 'Listings' },
  { value: 'EDIT_LIST', label: 'Edits' },
  { value: 'CANCEL_LIST', label: 'Cancellations' },
  { value: 'TOKENIZE', label: 'Imports' },
  { value: 'RETIRE', label: 'Retirements' },
  { value: 'DETOKENIZE', label: 'Detokenizations' },
]

function getTokenForMint(mint: string) {
  return MOCK_TOKENS.find((token) => token.mint === mint) ?? null
}

function getProjectName(mint: string) {
  const token = getTokenForMint(mint)
  return formatProjectName(token, token?.symbol ?? 'Carbon credit')
}

function getSolscanTxUrl(signature: string) {
  if (SOLSCAN_CLUSTER) {
    return `https://solscan.io/tx/${signature}?cluster=${SOLSCAN_CLUSTER}`
  }
  return `https://solscan.io/tx/${signature}`
}

function getEventSubtitle(event: ActivityEvent): string {
  const credits = `${event.amount.toLocaleString()} credits`
  switch (event.type) {
    case 'BUY':
      return `Bought ${credits} for ${formatUsdc(event.totalUsdc)}`
    case 'SELL':
      return `Sold ${credits} for ${formatUsdc(event.totalUsdc)}`
    case 'LIST':
      return `Listed ${credits} at ${formatUsdc(event.unitPriceUsdc)} each`
    case 'EDIT_LIST':
      return `Updated to ${credits} at ${formatUsdc(event.unitPriceUsdc)} each`
    case 'CANCEL_LIST':
      return `Cancelled listing of ${credits}`
    case 'TOKENIZE':
      return `Imported ${credits} from Puro`
    case 'RETIRE':
      return `Retired ${credits} permanently`
    case 'DETOKENIZE':
      return `Sent ${credits} back to Puro`
  }
}

export function ActivityPage() {
  const [filter, setFilter] = useState<FilterValue>('ALL')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sortedEvents = useMemo(
    () =>
      [...MOCK_ACTIVITY].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    []
  )

  const filteredEvents = useMemo(
    () =>
      filter === 'ALL'
        ? sortedEvents
        : sortedEvents.filter((event) => event.type === filter),
    [sortedEvents, filter]
  )

  const selectedEvent = selectedId
    ? sortedEvents.find((event) => event.id === selectedId) ?? null
    : null

  if (selectedEvent) {
    return (
      <ActivityDetail
        event={selectedEvent}
        onBack={() => setSelectedId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Your activity
        </h2>
        <p className="text-sm text-muted-foreground">
          Buys, sales, listings, imports, and retirements tied to your wallet.
        </p>
      </header>

      <FilterBar active={filter} onChange={setFilter} />

      {filteredEvents.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <ActivityList
          events={filteredEvents}
          onSelect={(id) => setSelectedId(id)}
        />
      )}
    </div>
  )
}

function FilterBar({
  active,
  onChange,
}: {
  active: FilterValue
  onChange: (value: FilterValue) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((option) => {
        const isActive = option.value === active
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground',
            ].join(' ')}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function ActivityList({
  events,
  onSelect,
}: {
  events: ActivityEvent[]
  onSelect: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card">
      <div className="grid grid-cols-[120px_minmax(0,1.6fr)_minmax(0,140px)_minmax(0,140px)_120px] items-center gap-4 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <div>Type</div>
        <div>Activity</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Date</div>
        <div className="text-right">Status</div>
      </div>

      <ul className="divide-y divide-border">
        {events.map((event) => {
          const projectName = getProjectName(event.vintageMint)
          return (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onSelect(event.id)}
                className="grid w-full grid-cols-[120px_minmax(0,1.6fr)_minmax(0,140px)_minmax(0,140px)_120px] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
              >
                <div>
                  <span
                    className={[
                      'inline-flex rounded px-2 py-0.5 text-[11px] font-semibold',
                      getActivityTypeChipClass(event.type),
                    ].join(' ')}
                  >
                    {ACTIVITY_TYPE_LABELS[event.type]}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {projectName}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {getEventSubtitle(event)}
                  </div>
                </div>
                <div className="num text-right text-sm font-semibold text-foreground">
                  {event.amount.toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground"> credits</span>
                </div>
                <div className="num text-right text-xs text-muted-foreground">
                  {formatActivityDate(event.timestamp)}
                </div>
                <div className="text-right">
                  <span
                    className={[
                      'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
                      getActivityStatusClass(event.status),
                    ].join(' ')}
                  >
                    {ACTIVITY_STATUS_LABELS[event.status]}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EmptyState({ filter }: { filter: FilterValue }) {
  const isAll = filter === 'ALL'
  return (
    <SharedEmptyState
      title={isAll ? 'No activity yet' : 'No matching activity'}
      description={
        isAll
          ? 'Buys, sales, listings, imports, and retirements will appear here as they happen.'
          : 'No events match this filter. Try a different filter.'
      }
    />
  )
}

function ActivityDetail({
  event,
  onBack,
}: {
  event: ActivityEvent
  onBack: () => void
}) {
  const token = getTokenForMint(event.vintageMint)
  const projectName = formatProjectName(token, token?.symbol ?? 'Carbon credit')
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name) ?? '—'

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to activity
      </button>

      <div className="overflow-hidden rounded-xl bg-card shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  'inline-flex rounded px-2 py-0.5 text-[11px] font-semibold',
                  getActivityTypeChipClass(event.type),
                ].join(' ')}
              >
                {ACTIVITY_TYPE_LABELS[event.type]}
              </span>
              <span
                className={[
                  'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
                  getActivityStatusClass(event.status),
                ].join(' ')}
              >
                {ACTIVITY_STATUS_LABELS[event.status]}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {getEventSubtitle(event)}
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              {ACTIVITY_TYPE_DESCRIPTIONS[event.type]}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              When
            </div>
            <div className="num mt-1 text-sm text-foreground">
              {formatActivityDateTime(event.timestamp)}
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2">
          <DetailRow label="Project" value={projectName} />
          <DetailRow label="Type" value={type} />
          <DetailRow label="Vintage" value={vintage} />
          <DetailRow
            label="Amount"
            value={`${event.amount.toLocaleString()} credits`}
          />

          {event.unitPriceUsdc !== undefined && (
            <DetailRow
              label="Unit price"
              value={`${formatUsdc(event.unitPriceUsdc)} per credit`}
            />
          )}
          {event.totalUsdc !== undefined && (
            <DetailRow
              label="Total"
              value={formatUsdc(event.totalUsdc)}
              emphasis
            />
          )}

          {event.previousAmount !== undefined && (
            <DetailRow
              label="Previous amount"
              value={`${event.previousAmount.toLocaleString()} credits`}
            />
          )}
          {event.previousUnitPriceUsdc !== undefined && (
            <DetailRow
              label="Previous unit price"
              value={`${formatUsdc(event.previousUnitPriceUsdc)} per credit`}
            />
          )}

          {event.counterparty && (
            <DetailRow
              label="Counterparty"
              value={
                <span className="font-mono text-xs">
                  {shortAddress(event.counterparty)}
                </span>
              }
            />
          )}

          {event.listingPublicKey && (
            <DetailRow
              label="Listing"
              value={
                <span className="font-mono text-xs">
                  {shortAddress(event.listingPublicKey)}
                </span>
              }
            />
          )}

          {event.puroAccountNumber && (
            <DetailRow
              label="Puro account"
              value={<span className="font-mono text-xs">{event.puroAccountNumber}</span>}
            />
          )}
          {event.puroIncomingTxId && (
            <DetailRow
              label="Puro tx ID"
              value={<span className="font-mono text-xs">{event.puroIncomingTxId}</span>}
            />
          )}
          {event.certificateId && (
            <DetailRow
              label="Certificate ID"
              value={<span className="font-mono text-xs">{event.certificateId}</span>}
            />
          )}

          {event.beneficiaryName && (
            <DetailRow label="Beneficiary" value={event.beneficiaryName} />
          )}
          {event.beneficiaryReason && (
            <DetailRow label="Reason" value={event.beneficiaryReason} />
          )}
        </div>

        {event.txSignature && (
          <div className="border-t border-border px-6 py-4">
            <a
              href={getSolscanTxUrl(event.txSignature)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View transaction on Solscan
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}

        {event.errorMessage && (
          <div className="border-t border-border bg-rose-50 px-6 py-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
              Error
            </div>
            <p className="mt-1 text-sm leading-6 text-rose-800">
              {event.errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 bg-card px-6 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={[
          'text-sm text-foreground',
          emphasis ? 'font-semibold' : '',
        ].join(' ')}
      >
        {value}
      </div>
    </div>
  )
}
