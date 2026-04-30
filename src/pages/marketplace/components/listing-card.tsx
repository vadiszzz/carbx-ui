import { MapPin } from 'lucide-react'
import type { VintageToken } from '@/shared/lib/vintage-tokens'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
  gradientForType,
} from '../lib/listing-meta'

type ListingCardProps = {
  amountAvailable: string
  unitPrice: string
  token: VintageToken | null
  fallbackName: string
  location?: string | null
  isMine: boolean
  onView: () => void
  onEdit?: () => void
  onClose?: () => void
  disabled?: boolean
}

export function ListingCard({
  amountAvailable,
  unitPrice,
  token,
  fallbackName,
  location,
  isMine,
  onView,
  onEdit,
  onClose,
  disabled,
}: ListingCardProps) {
  const projectName = formatProjectName(token, fallbackName)
  const type = detectProjectType(token?.name)
  const vintage = extractVintage(token?.name)
  const gradient = gradientForType(type)

  const baseClass =
    'group relative flex flex-col overflow-hidden rounded-xl bg-card transition-shadow'
  const borderClass = isMine
    ? 'shadow-[0_0_0_2px_var(--primary)]'
    : 'shadow-card hover:shadow-md'

  return (
    <article className={`${baseClass} ${borderClass}`}>
      <div
        className="relative aspect-[4/3] w-full"
        style={{ background: gradient }}
      >
        <span className="absolute left-2 top-2 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
          {type}
        </span>
        {isMine && (
          <span className="absolute right-2 top-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
            Yours
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
          {projectName}
        </h3>

        {location && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {location}
            {vintage && <span> · {vintage}</span>}
          </div>
        )}
        {!location && vintage && (
          <div className="mt-1 text-xs text-muted-foreground">Vintage {vintage}</div>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
          <div>
            <div className="num text-base font-bold text-foreground">
              ${unitPrice}
            </div>
            <div className="text-[10px] text-muted-foreground">per credit</div>
          </div>
          <div className="text-right">
            <div className="num text-xs font-semibold text-foreground">
              {Number(amountAvailable).toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground">available</div>
          </div>
        </div>

        {isMine && onEdit && onClose ? (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onEdit}
              disabled={disabled}
              className="rounded-md border border-border-strong px-2 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={disabled}
              className="rounded-md px-2 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-muted disabled:opacity-50"
            >
              Close
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onView}
            disabled={disabled}
            className="mt-3 w-full rounded-md bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            View
          </button>
        )}
      </div>
    </article>
  )
}
