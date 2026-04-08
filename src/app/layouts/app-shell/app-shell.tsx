import { useEffect, useRef } from 'react'
import { Leaf } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { useUsdcBalanceQuery } from '@/shared/api/solana/queries/use-usdc-balance-query'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { PrivyAuthDialog } from '@/shared/auth/ui/privy-auth-dialog'
import { QUERY_KEYS } from '@/shared/constants/query-keys'

const navigationItems = [
  { to: ROUTE_PATHS.tokenize, label: 'Tokenize' },
  { to: ROUTE_PATHS.marketplace, label: 'Marketplace' },
  { to: ROUTE_PATHS.orders, label: 'Orders' },
  { to: ROUTE_PATHS.tokens, label: 'Tokens' },
] as const

export function AppShell() {
  const { authenticated, ready } = usePrivy()
  const { walletAddress } = usePrivyAuth()
  const queryClient = useQueryClient()
  const wasAuthenticatedRef = useRef(authenticated)
  const usdcBalanceQuery = useUsdcBalanceQuery(walletAddress)

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
    <div className="app-canvas">
      <div className="app-shell-frame flex min-h-screen flex-col gap-6">
        <header className="app-panel px-4 py-4 sm:px-5">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#0f5d7a)] text-white shadow-lg shadow-cyan-900/20">
                <Leaf className="size-5" />
              </div>
              <div className="grid gap-0.5">
                <p className="m-0 text-lg font-semibold tracking-tight text-slate-950">
                  CarbX
                </p>
              </div>
            </div>

            <nav
              aria-label="Main navigation"
              className="flex flex-wrap items-center gap-2 lg:justify-center"
            >
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  className="app-nav-link"
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <div className="hidden text-sm font-medium text-slate-700 sm:block">
                <span className="text-slate-500">Balance:</span>{' '}
                <span className="text-base font-semibold text-slate-950">
                  {walletAddress
                    ? usdcBalanceQuery.isLoading || usdcBalanceQuery.isFetching
                      ? 'Loading...'
                      : formatUsdcBalance(usdcBalanceQuery.data ?? 0)
                    : 'No wallet'}
                </span>{' '}
                {walletAddress ? (
                  <span className="text-slate-500">USDC</span>
                ) : null}
              </div>
              <PrivyAuthDialog />
            </div>
          </div>
        </header>

        <main className="app-panel-strong flex-1 p-5 sm:p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function formatUsdcBalance(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
