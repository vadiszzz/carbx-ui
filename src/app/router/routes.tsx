import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ROUTE_PATHS, ROUTE_SEGMENTS } from '@/app/router/route-paths'
import { AppShell } from '@/app/layouts/app-shell'
import { ProtectedRoute } from '@/app/router/protected-route'
import { LoginPage } from '@/pages/auth'
import { OrdersPage } from '@/pages/orders'
import { TokenizePage } from '@/pages/tokenize'
import { TokensPage } from '@/pages/tokens'

export const appRouter = createBrowserRouter([
  {
    path: ROUTE_PATHS.home,
    element: <Navigate replace to={ROUTE_PATHS.login} />,
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
            element: <Navigate replace to={ROUTE_PATHS.tokenize} />,
          },
          {
            path: ROUTE_SEGMENTS.tokenize,
            element: <TokenizePage />,
          },
          {
            path: ROUTE_SEGMENTS.orders,
            element: <OrdersPage />,
          },
          {
            path: ROUTE_SEGMENTS.tokens,
            element: <TokensPage />,
          },
          {
            path: '*',
            element: <Navigate replace to={ROUTE_PATHS.tokenize} />,
          },
        ],
      },
    ],
  },
])
