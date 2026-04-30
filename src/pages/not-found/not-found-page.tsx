import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { ROUTE_PATHS } from '@/app/router/route-paths'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-border bg-card p-12 text-center shadow-card">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          That URL doesn’t exist on CarbX. Check the address or head back to the
          marketplace.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          to={ROUTE_PATHS.marketplace}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        >
          Go to marketplace
        </Link>
        <Link
          to={ROUTE_PATHS.portfolio}
          className="inline-flex items-center justify-center rounded-lg border border-border-strong bg-card px-4 py-2 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
        >
          View portfolio
        </Link>
      </div>
    </div>
  )
}
