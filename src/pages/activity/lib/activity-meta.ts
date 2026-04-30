import type { ActivityEventType, ActivityStatus } from './mock-activity'

export const ACTIVITY_TYPE_LABELS: Record<ActivityEventType, string> = {
  BUY: 'Buy',
  SELL: 'Sell',
  LIST: 'List',
  EDIT_LIST: 'Edit listing',
  CANCEL_LIST: 'Cancel listing',
  TOKENIZE: 'Import',
  RETIRE: 'Retire',
  DETOKENIZE: 'Detokenize',
}

export const ACTIVITY_TYPE_DESCRIPTIONS: Record<ActivityEventType, string> = {
  BUY: 'Purchased credits from another holder.',
  SELL: 'Another buyer purchased credits from your listing.',
  LIST: 'Created a marketplace listing — credits moved into escrow.',
  EDIT_LIST: 'Updated the price or amount of an existing listing.',
  CANCEL_LIST: 'Cancelled a listing — credits returned from escrow.',
  TOKENIZE: 'Imported CORC credits from Puro Registry into CarbX as on-chain tokens.',
  RETIRE: 'Retired credits permanently — claimed the offset on Puro Registry.',
  DETOKENIZE: 'Sent on-chain tokens back to Puro Registry as standard CORC credits.',
}

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  SUCCESS: 'Success',
  IN_PROGRESS: 'In progress',
  ERROR: 'Error',
}

export function getActivityStatusClass(status: ActivityStatus) {
  switch (status) {
    case 'SUCCESS':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'IN_PROGRESS':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case 'ERROR':
      return 'border-rose-200 bg-rose-50 text-rose-700'
  }
}

export function getActivityTypeChipClass(type: ActivityEventType) {
  switch (type) {
    case 'BUY':
    case 'TOKENIZE':
      return 'bg-emerald-50 text-emerald-700'
    case 'SELL':
      return 'bg-sky-50 text-sky-700'
    case 'LIST':
    case 'EDIT_LIST':
      return 'bg-muted text-foreground'
    case 'CANCEL_LIST':
    case 'DETOKENIZE':
      return 'bg-muted text-muted-foreground'
    case 'RETIRE':
      return 'bg-stone-100 text-stone-700'
  }
}

export function formatActivityDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatActivityDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatUsdc(value?: number) {
  if (value === undefined || value === null) return '—'
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function shortAddress(value?: string) {
  if (!value) return '—'
  if (value.length <= 14) return value
  return `${value.slice(0, 6)}…${value.slice(-6)}`
}
