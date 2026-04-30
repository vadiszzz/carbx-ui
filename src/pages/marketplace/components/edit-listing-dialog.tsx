import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import type { VintageToken } from '@/shared/lib/vintage-tokens'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '../lib/listing-meta'

type EditListingDialogProps = {
  isSubmitting: boolean
  listing: {
    user: string
    amountToSell: string
    unitPrice: string
  } | null
  token: VintageToken | null
  amount: string
  price: string
  onAmountChange: (value: string) => void
  onPriceChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function EditListingDialog({
  isSubmitting,
  listing,
  token,
  amount,
  price,
  onAmountChange,
  onPriceChange,
  onClose,
  onSubmit,
}: EditListingDialogProps) {
  const projectName = formatProjectName(token, 'Carbon credit')
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name)

  const submitDisabled =
    isSubmitting ||
    parseAmount(amount) <= 0 ||
    parseAmount(price) <= 0

  return (
    <Dialog
      open={Boolean(listing)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Edit listing
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {projectName}
            {vintage ? ` · Vintage ${vintage}` : ''}
            {` · ${type}`}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <FieldGroup label="Amount (credits)">
            <input
              inputMode="numeric"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder={listing?.amountToSell ?? '0'}
              disabled={isSubmitting}
              className="num w-full rounded-lg border border-border-strong bg-card px-3 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
            />
          </FieldGroup>

          <FieldGroup label="Unit price">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <input
                inputMode="decimal"
                value={price}
                onChange={(event) => onPriceChange(event.target.value)}
                placeholder={listing?.unitPrice ?? '0.00'}
                disabled={isSubmitting}
                className="num w-full rounded-lg border border-border-strong bg-card py-2.5 pl-7 pr-3 text-base font-semibold text-foreground outline-none focus:border-primary"
              />
            </div>
          </FieldGroup>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
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
            disabled={submitDisabled}
            onClick={onSubmit}
            className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Saving
              </span>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}
