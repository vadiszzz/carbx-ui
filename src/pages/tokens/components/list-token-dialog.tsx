import { Loader2, Minus, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  formatVintageTokenAmount,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '@/pages/marketplace/lib/listing-meta'

type ListTokenDialogProps = {
  token: VintageToken | null
  amount: string
  price: string
  isSubmitting: boolean
  onAmountChange: (value: string) => void
  onPriceChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

const QUICK_FRACTIONS = [0.25, 0.5, 0.75, 1] as const

export function ListTokenDialog({
  token,
  amount,
  price,
  isSubmitting,
  onAmountChange,
  onPriceChange,
  onClose,
  onSubmit,
}: ListTokenDialogProps) {
  const projectName = formatProjectName(token, token?.symbol ?? 'Carbon credit')
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name)
  const available = parseAvailable(token)
  const amountNum = parseAmount(amount)
  const priceNum = parseAmount(price)

  const total = amountNum * priceNum

  function adjust(delta: number) {
    const next = Math.max(0, amountNum + delta)
    onAmountChange(String(next))
  }

  return (
    <Dialog
      open={Boolean(token)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            List for sale
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {projectName}
            {vintage ? ` · Vintage ${vintage}` : ''}
            {` · ${type}`}
          </p>
        </DialogHeader>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount to list
          </label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-border-strong">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={isSubmitting}
              className="flex items-center justify-center px-4 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Minus className="size-4" />
            </button>
            <input
              inputMode="numeric"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              disabled={isSubmitting}
              className="num flex-1 bg-transparent py-2.5 text-center text-base font-semibold text-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={isSubmitting}
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
                  onClick={() => onAmountChange(String(value))}
                  disabled={isSubmitting || value <= 0}
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
          <p className="mt-2 text-xs text-muted-foreground">
            Available: <span className="num">{token ? formatVintageTokenAmount(token) : '—'}</span> credits
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Price per credit
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              $
            </span>
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => onPriceChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="0.00"
              className="num w-full rounded-lg border border-border-strong bg-card py-2.5 pl-7 pr-3 text-base font-semibold text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Total listing value</span>
            <span className="num text-xl font-bold text-foreground">
              ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg border border-border-strong px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting || amountNum <= 0 || priceNum <= 0}
            onClick={onSubmit}
            className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Listing
              </span>
            ) : (
              'List for sale'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Tokens move to a listing escrow until the listing is filled or closed.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function parseAvailable(token: VintageToken | null): number {
  if (!token?.tokenInfo) return 0
  const balance = (token.tokenInfo as { balance?: unknown }).balance
  if (typeof balance === 'number' && Number.isFinite(balance)) return balance
  return 0
}
