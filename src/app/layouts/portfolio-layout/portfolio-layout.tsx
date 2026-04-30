import { NavLink, Outlet } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/router/route-paths'

const subNavItems = [
  { to: ROUTE_PATHS.portfolioHoldings, label: 'Holdings' },
  { to: ROUTE_PATHS.portfolioDeposit, label: 'Deposit' },
  { to: ROUTE_PATHS.portfolioWithdraw, label: 'Withdraw' },
  { to: ROUTE_PATHS.portfolioActivity, label: 'Activity' },
] as const

export function PortfolioLayout() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Portfolio</h1>
        <p className="max-w-xl text-muted-foreground">
          Everything you own, what's listed for sale, and your account history.
        </p>
      </header>

      <nav
        aria-label="Portfolio sections"
        className="flex flex-wrap items-center gap-1 border-b border-border"
      >
        {subNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                'relative -mb-px px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  )
}
