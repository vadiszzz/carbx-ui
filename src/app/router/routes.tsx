import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { AppShell } from '@/app/layouts/app-shell'
import { PortfolioLayout } from '@/app/layouts/portfolio-layout'
import { ProtectedRoute } from '@/app/router/protected-route'
import { LoginPage } from '@/pages/auth'
import { AccountPage } from '@/pages/account'
import { ListingDetailPage, MarketplacePage } from '@/pages/marketplace'
import { ActivityPage } from '@/pages/activity'
import { DepositPage } from '@/pages/deposit'
import { NotFoundPage } from '@/pages/not-found'
import { TokensPage } from '@/pages/tokens'
import { WithdrawPage } from '@/pages/withdraw'

export const appRouter = createBrowserRouter([
  {
    path: ROUTE_PATHS.home,
    element: <LoginPage />,
  },
  {
    path: ROUTE_PATHS.login,
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTE_PATHS.home,
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate replace to={ROUTE_PATHS.marketplace} />,
          },
          {
            path: 'marketplace',
            element: <MarketplacePage />,
          },
          {
            path: 'marketplace/:listingPublicKey',
            element: <ListingDetailPage />,
          },
          {
            path: 'portfolio',
            element: <PortfolioLayout />,
            children: [
              {
                index: true,
                element: <Navigate replace to={ROUTE_PATHS.portfolioHoldings} />,
              },
              {
                path: 'holdings',
                element: <TokensPage />,
              },
              {
                path: 'deposit',
                element: <DepositPage />,
              },
              {
                path: 'withdraw',
                element: <WithdrawPage />,
              },
              {
                path: 'activity',
                element: <ActivityPage />,
              },
              {
                path: 'import',
                element: <Navigate replace to={ROUTE_PATHS.portfolioDeposit} />,
              },
              {
                path: 'listings',
                element: <Navigate replace to={ROUTE_PATHS.portfolioHoldings} />,
              },
              {
                path: 'tokenize',
                element: <Navigate replace to={ROUTE_PATHS.portfolioDeposit} />,
              },
            ],
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
          {
            path: 'tokens',
            element: <Navigate replace to={ROUTE_PATHS.portfolioHoldings} />,
          },
          {
            path: 'orders',
            element: <Navigate replace to={ROUTE_PATHS.portfolioActivity} />,
          },
          {
            path: 'tokenize',
            element: <Navigate replace to={ROUTE_PATHS.portfolioDeposit} />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
])
