import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, RotateCw } from 'lucide-react'

type Tone = 'neutral' | 'error'

type StateMessageProps = {
  title: string
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  tone?: Tone
  className?: string
}

export function StateMessage({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  className,
}: StateMessageProps) {
  const iconWrapClass =
    tone === 'error'
      ? 'bg-rose-50 text-rose-700'
      : 'bg-muted text-muted-foreground'

  return (
    <div
      className={[
        'flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center shadow-card',
        className ?? '',
      ].join(' ')}
    >
      {icon ? (
        <div
          className={[
            'flex size-12 items-center justify-center rounded-full',
            iconWrapClass,
          ].join(' ')}
        >
          {icon}
        </div>
      ) : null}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function EmptyState(
  props: Omit<StateMessageProps, 'tone' | 'icon'> & { icon?: ReactNode }
) {
  const { icon, ...rest } = props
  return (
    <StateMessage
      tone="neutral"
      icon={icon ?? <Inbox className="size-5" />}
      {...rest}
    />
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retryLabel = 'Try again',
}: {
  title?: string
  description?: ReactNode
  onRetry?: () => void
  retryLabel?: string
}) {
  return (
    <StateMessage
      tone="error"
      icon={<AlertTriangle className="size-5" />}
      title={title}
      description={description}
      action={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RotateCw className="size-4" />
            {retryLabel}
          </button>
        ) : null
      }
    />
  )
}
