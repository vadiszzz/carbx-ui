import { Navigate, Outlet } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { ROUTE_PATHS } from '@/app/router/route-paths'

export function ProtectedRoute() {
  const { authenticated, ready } = usePrivy()

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-sm text-slate-500">
        Loading session...
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate replace to={ROUTE_PATHS.login} />
  }

  return <Outlet />
}
