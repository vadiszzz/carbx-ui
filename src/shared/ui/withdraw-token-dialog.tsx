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

type WithdrawTokenDialogProps = {
  open: boolean
  title?: string
  description?: string
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

export function WithdrawTokenDialog({
  open,
  title = 'Withdraw token',
  description = 'Enter the Solana recipient address and the amount to transfer.',
  tokenName,
  tokenSymbol,
  tokenMint,
  availableAmount,
  amount,
  recipient,
  isSubmitting,
  onAmountChange,
  onRecipientChange,
  onClose,
  onSubmit,
}: WithdrawTokenDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-slate-700">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p className="m-0">
              <span className="text-muted-foreground">Token:</span> {tokenName}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Symbol:</span>{' '}
              {tokenSymbol ?? '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Available:</span>{' '}
              {availableAmount ?? '-'}
            </p>
            <p className="m-0 break-all">
              <span className="text-muted-foreground">Mint:</span> {tokenMint}
            </p>
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Recipient Solana address</p>
            <Input
              onChange={(event) => onRecipientChange(event.target.value)}
              value={recipient}
            />
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Amount</p>
            <Input
              inputMode="decimal"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="1.00"
              value={amount}
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={isSubmitting} onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Withdraw'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
