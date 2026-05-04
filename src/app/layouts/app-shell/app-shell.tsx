import { useEffect, useRef } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LogIn, Wallet } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import { DEMO_MODE } from '@/shared/config/demo-mode'

const navigationItems = [
  { to: ROUTE_PATHS.marketplace, label: 'Marketplace' },
  { to: ROUTE_PATHS.portfolio, label: 'Portfolio' },
] as const

export function AppShell() {
  const { authenticated, ready } = usePrivy()
  const queryClient = useQueryClient()
  const wasAuthenticatedRef = useRef(authenticated)

  useEffect(() => {
    if (!ready) return

    const wasAuthenticated = wasAuthenticatedRef.current

    if (wasAuthenticated && !authenticated) {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.PURO_ACCOUNT })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.ORDERS_GROUPED })
    }

    wasAuthenticatedRef.current = authenticated
  }, [authenticated, queryClient, ready])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
        {DEMO_MODE && (
          <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-2 text-xs font-medium">
              <span>Demo mode is on. Listings, holdings, account data, and cash-onramp flows use mock data.</span>
              <span>No live blockchain or backend transactions are sent.</span>
            </div>
          </div>
        )}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-10">
            <NavLink
              to={ROUTE_PATHS.marketplace}
              className="text-lg font-bold tracking-tight text-foreground"
            >
              CarbX
            </NavLink>

            <nav aria-label="Main navigation" className="flex items-center gap-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <NavLink
            to={ROUTE_PATHS.account}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                authenticated
                  ? isActive
                    ? 'border border-border-strong bg-muted text-foreground'
                    : 'border border-border bg-card text-foreground hover:bg-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              ].join(' ')
            }
          >
            {authenticated ? <Wallet className="size-4" /> : <LogIn className="size-4" />}
            {authenticated ? 'Account' : 'Sign in'}
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
