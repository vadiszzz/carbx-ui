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

type BurnTokenDialogProps = {
  token: VintageToken | null
  amount: string
  puroUserUuid: string
  isSubmitting: boolean
  onAmountChange: (value: string) => void
  onPuroUserUuidChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export function BurnTokenDialog({
  token,
  amount,
  puroUserUuid,
  isSubmitting,
  onAmountChange,
  onPuroUserUuidChange,
  onClose,
  onSubmit,
}: BurnTokenDialogProps) {
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
          <DialogTitle>Redeem token</DialogTitle>
          <DialogDescription className="text-slate-700">
            After burning, CORC tokens will be sent to the puro account you
            specify.
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
              <span className="text-muted-foreground">Amount:</span>{' '}
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
              inputMode="decimal"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="20"
              value={amount}
            />
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Puro receiving address</p>
            <Input
              onChange={(event) => onPuroUserUuidChange(event.target.value)}
              placeholder="d0e74115-132e-402f-838e-b2579dba6355"
              value={puroUserUuid}
            />
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
              'Confirm Redeem'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
