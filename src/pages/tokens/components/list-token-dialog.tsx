import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import {
  formatVintageTokenAmount,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'

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
  return (
    <Dialog
      open={Boolean(token)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>List token</DialogTitle>
          <DialogDescription className="text-slate-700">
            Set the amount to sell and the unit price in USDC.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p className="m-0">
              <span className="text-muted-foreground">Token:</span>{' '}
              {token?.name ?? '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Symbol:</span>{' '}
              {token?.symbol ?? '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Available:</span>{' '}
              {token ? formatVintageTokenAmount(token) : '-'}
            </p>
            <p className="m-0 break-all">
              <span className="text-muted-foreground">Mint:</span>{' '}
              {token?.mint ?? '-'}
            </p>
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Amount</p>
            <Input
              inputMode="numeric"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="1"
              value={amount}
            />
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Unit price</p>
            <Input
              inputMode="decimal"
              onChange={(event) => onPriceChange(event.target.value)}
              placeholder="1.00"
              value={price}
            />
            <p className="m-0 text-xs text-muted-foreground">
              Enter the price in USDC
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm List'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
