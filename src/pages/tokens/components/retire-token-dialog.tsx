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
  clampIntegerInput,
  clampIntegerValue,
} from '@/shared/lib/numeric-input'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '@/pages/marketplace/lib/listing-meta'
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

const QUICK_FRACTIONS = [0.25, 0.5, 0.75, 1] as const

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
  const available = parseAvailable(token)
  const amountNum = parseAmount(amount)
  const projectName = formatProjectName(token, token?.symbol ?? 'Carbon credit')
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name)

  function adjust(delta: number) {
    const next = clampIntegerValue(amountNum + delta, available)
    onAmountChange(String(next))
  }

  return (
    <Dialog
      open={Boolean(token)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose()
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Retire credits
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {projectName}
            {vintage ? ` · Vintage ${vintage}` : ''}
            {` · ${type}`}
          </p>
        </DialogHeader>

        <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          Retiring permanently claims credits as your carbon offset. The
          retirement is logged at Puro Registry and on Solana — it cannot be
          reversed.
        </p>

        <Section label="Amount">
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
              onChange={(event) => onAmountChange(clampIntegerInput(event.target.value, available))}
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
          <div className="mt-2 grid grid-cols-4 gap-2">
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
        </Section>

        <Section label="Beneficiary">
          <Field label="Beneficiary name">
            <TextInput
              value={form.beneficiaryName}
              placeholder="Acme Corp"
              onChange={(value) => onFormChange({ beneficiaryName: value })}
              disabled={isSubmitting}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Location">
              <TextInput
                value={form.beneficiaryLocation}
                placeholder="Berlin, Germany"
                onChange={(value) => onFormChange({ beneficiaryLocation: value })}
                disabled={isSubmitting}
              />
            </Field>
            <Field label="Beneficiary type">
              <SelectInput
                value={form.beneficiaryType}
                options={RETIRE_BENEFICIARY_OPTIONS}
                onChange={(value) =>
                  onFormChange({
                    beneficiaryType: value as RetireFormState['beneficiaryType'],
                  })
                }
                disabled={isSubmitting}
              />
            </Field>
          </div>
          <Field label="Contact email">
            <TextInput
              value={form.beneficiaryContactPersonEmail}
              placeholder="contact@acme.com"
              onChange={(value) =>
                onFormChange({ beneficiaryContactPersonEmail: value })
              }
              disabled={isSubmitting}
              type="email"
            />
          </Field>
        </Section>

        <Section label="Usage">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Usage type">
              <SelectInput
                value={form.usageType}
                options={RETIRE_USAGE_OPTIONS}
                onChange={(value) =>
                  onFormChange({
                    usageType: value as RetireFormState['usageType'],
                  })
                }
                disabled={isSubmitting}
              />
            </Field>
            <Field label="Country of consumption">
              <TextInput
                value={form.countryOfConsumption}
                placeholder="DE"
                onChange={(value) => onFormChange({ countryOfConsumption: value })}
                disabled={isSubmitting}
              />
            </Field>
          </div>
          <Field label="Retirement purpose">
            <TextInput
              value={form.retirementPurpose}
              placeholder="Internal climate target"
              onChange={(value) => onFormChange({ retirementPurpose: value })}
              disabled={isSubmitting}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Consumption start date">
              <TextInput
                type="date"
                value={form.consumptionPeriodStartDate}
                onChange={(value) =>
                  onFormChange({ consumptionPeriodStartDate: value })
                }
                disabled={isSubmitting}
              />
            </Field>
            <Field label="Consumption end date">
              <TextInput
                type="date"
                value={form.consumptionPeriodEndDate}
                onChange={(value) =>
                  onFormChange({ consumptionPeriodEndDate: value })
                }
                disabled={isSubmitting}
              />
            </Field>
          </div>
        </Section>

        <Section label="Optional">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Beneficiary hidden until">
              <TextInput
                type="date"
                value={form.beneficiaryHiddenUntil}
                onChange={(value) => onFormChange({ beneficiaryHiddenUntil: value })}
                disabled={isSubmitting}
              />
            </Field>
            <Field label="Offtake agreement ID">
              <TextInput
                value={form.offtakeAgreementId}
                placeholder="optional"
                onChange={(value) => onFormChange({ offtakeAgreementId: value })}
                disabled={isSubmitting}
              />
            </Field>
          </div>
        </Section>

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
            disabled={isSubmitting || amountNum <= 0}
            onClick={onSubmit}
            className="rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Retiring
              </span>
            ) : (
              'Retire credits'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput({
  value,
  placeholder,
  onChange,
  disabled,
  type = 'text',
}: {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
    />
  )
}

function SelectInput({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="w-full rounded-lg border border-border-strong bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
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
