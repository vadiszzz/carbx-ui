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
import {
  RETIRE_BENEFICIARY_OPTIONS,
  RETIRE_USAGE_OPTIONS,
  type RetireFormState,
} from '../model'

type RetireTokenDialogProps = {
  token: VintageToken | null
  amount: string
  form: RetireFormState
  isSubmitting: boolean
  onAmountChange: (value: string) => void
  onFormChange: (patch: Partial<RetireFormState>) => void
  onClose: () => void
  onSubmit: () => void
}

export function RetireTokenDialog({
  token,
  amount,
  form,
  isSubmitting,
  onAmountChange,
  onFormChange,
  onClose,
  onSubmit,
}: RetireTokenDialogProps) {
  return (
    <Dialog
      open={Boolean(token)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-x-hidden overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Retire token</DialogTitle>
          <DialogDescription className="text-slate-700">
            Fill retire details, then confirm retirement on-chain.
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
            <p className="m-0 text-sm text-slate-700">Beneficiary name</p>
            <Input
              onChange={(event) =>
                onFormChange({ beneficiaryName: event.target.value })
              }
              placeholder="Acme Corp"
              value={form.beneficiaryName}
            />
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Beneficiary location</p>
              <Input
                onChange={(event) =>
                  onFormChange({ beneficiaryLocation: event.target.value })
                }
                placeholder="Berlin, Germany"
                value={form.beneficiaryLocation}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">
                Beneficiary contact email
              </p>
              <Input
                onChange={(event) =>
                  onFormChange({
                    beneficiaryContactPersonEmail: event.target.value,
                  })
                }
                placeholder="contact@acme.com"
                value={form.beneficiaryContactPersonEmail}
              />
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Beneficiary type</p>
              <select
                className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                onChange={(event) =>
                  onFormChange({
                    beneficiaryType: event.target.value as RetireFormState['beneficiaryType'],
                  })
                }
                value={form.beneficiaryType}
              >
                {RETIRE_BENEFICIARY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Usage type</p>
              <select
                className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                onChange={(event) =>
                  onFormChange({
                    usageType: event.target.value as RetireFormState['usageType'],
                  })
                }
                value={form.usageType}
              >
                {RETIRE_USAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Country of consumption</p>
              <Input
                onChange={(event) =>
                  onFormChange({ countryOfConsumption: event.target.value })
                }
                placeholder="DE"
                value={form.countryOfConsumption}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Retirement purpose</p>
              <Input
                onChange={(event) =>
                  onFormChange({ retirementPurpose: event.target.value })
                }
                placeholder="Internal climate target"
                value={form.retirementPurpose}
              />
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Consumption start date</p>
              <Input
                onChange={(event) =>
                  onFormChange({
                    consumptionPeriodStartDate: event.target.value,
                  })
                }
                placeholder="2026-01-01"
                type="date"
                value={form.consumptionPeriodStartDate}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Consumption end date</p>
              <Input
                onChange={(event) =>
                  onFormChange({
                    consumptionPeriodEndDate: event.target.value,
                  })
                }
                placeholder="2026-12-31"
                type="date"
                value={form.consumptionPeriodEndDate}
              />
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">
                Beneficiary hidden until
              </p>
              <Input
                onChange={(event) =>
                  onFormChange({ beneficiaryHiddenUntil: event.target.value })
                }
                placeholder="2026-12-31"
                type="date"
                value={form.beneficiaryHiddenUntil}
              />
            </div>
            <div className="grid min-w-0 gap-1.5">
              <p className="m-0 text-sm text-slate-700">Offtake agreement ID</p>
              <Input
                onChange={(event) =>
                  onFormChange({ offtakeAgreementId: event.target.value })
                }
                placeholder="optional"
                value={form.offtakeAgreementId}
              />
            </div>
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
              'Confirm Retire'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
