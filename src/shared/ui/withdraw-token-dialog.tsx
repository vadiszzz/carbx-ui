import { Loader2, Minus, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

type WithdrawTokenDialogProps = {
  open: boolean
  title?: string
  subtitle?: string
  tokenName: string
  tokenSymbol?: string | null
  tokenMint: string
  availableAmount?: string
  amount: string
  recipient: string
  isSubmitting: boolean
  onAmountChange: (value: string) => void
  onRecipientChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

const QUICK_FRACTIONS = [0.25, 0.5, 0.75, 1] as const

export function WithdrawTokenDialog({
  open,
  title = 'Withdraw to wallet',
  subtitle,
  tokenName,
  tokenSymbol,
  availableAmount,
  amount,
  recipient,
  isSubmitting,
  onAmountChange,
  onRecipientChange,
  onClose,
  onSubmit,
}: WithdrawTokenDialogProps) {
  const headerSubtitle = subtitle ?? [tokenName, tokenSymbol].filter(Boolean).join(' · ')
  const available = parseAvailableNumber(availableAmount)
  const amountNum = parseAmount(amount)
  const recipientTrim = recipient.trim()
  const recipientValid = recipientTrim.length >= 32 && recipientTrim.length <= 44

  function adjust(delta: number) {
    const next = Math.max(0, amountNum + delta)
    onAmountChange(String(next))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          {headerSubtitle && (
            <p className="text-sm text-muted-foreground">{headerSubtitle}</p>
          )}
        </DialogHeader>

        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Send tokens to a different Solana wallet. Transfers are irreversible — double-check the recipient address.
        </p>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recipient Solana address
          </label>
          <input
            value={recipient}
            onChange={(event) => onRecipientChange(event.target.value)}
            disabled={isSubmitting}
            placeholder="Enter Solana address"
            className="w-full rounded-lg border border-border-strong bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
          />
          {recipientTrim.length > 0 && !recipientValid && (
            <p className="mt-1 text-xs text-destructive">
              Address looks too short or too long. Solana addresses are 32–44 characters.
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Amount
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
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="0"
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
          {availableAmount && (
            <p className="mt-2 text-xs text-muted-foreground">
              Available: <span className="num">{availableAmount}</span>
            </p>
          )}
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
            disabled={isSubmitting || amountNum <= 0 || !recipientValid}
            onClick={onSubmit}
            className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Sending
              </span>
            ) : (
              'Send tokens'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function parseAvailableNumber(value?: string): number {
  if (!value) return 0
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}
