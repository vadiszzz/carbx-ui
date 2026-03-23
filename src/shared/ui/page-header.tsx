import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type PageHeaderProps = {
  kicker?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  stats?: ReactNode
  className?: string
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  stats,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn('grid gap-5', className)}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-3">
          {kicker ? <div>{kicker}</div> : null}
          <div className="grid gap-2">
            <h2 className="page-title">{title}</h2>
            {description ? <p className="page-copy">{description}</p> : null}
          </div>
        </div>
        {actions ? (
          <div className="app-toolbar lg:justify-end">{actions}</div>
        ) : null}
      </div>
      {stats ? <div className="info-grid">{stats}</div> : null}
    </section>
  )
}
