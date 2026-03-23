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
  formatSolanaAddressShort,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'

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
  return (
    <Dialog
      open={Boolean(listing)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit listing</DialogTitle>
          <DialogDescription className="text-slate-700">
            Update listing amount and unit price in USDC.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p className="m-0">
              <span className="text-muted-foreground">Token:</span>{' '}
              {token?.name ?? token?.symbol ?? '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Seller:</span>{' '}
              {listing ? formatSolanaAddressShort(listing.user) : '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Current amount:</span>{' '}
              {listing?.amountToSell ?? '-'}
            </p>
            <p className="m-0">
              <span className="text-muted-foreground">Current price:</span>{' '}
              {listing?.unitPrice ?? '-'} USDC
            </p>
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Amount</p>
            <Input
              inputMode="numeric"
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder={listing?.amountToSell ?? '1'}
              value={amount}
            />
          </div>

          <div className="grid gap-1.5">
            <p className="m-0 text-sm text-slate-700">Unit price</p>
            <Input
              inputMode="decimal"
              onChange={(event) => onPriceChange(event.target.value)}
              placeholder={listing?.unitPrice ?? '1.00'}
              value={price}
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
              'Save changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
