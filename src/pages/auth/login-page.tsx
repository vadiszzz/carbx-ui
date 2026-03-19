import { Wallet } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { PrivyAccountSummary } from '@/shared/auth/ui/privy-account-summary'

export function LoginPage() {
  const { authenticated, ready, login } = usePrivy()

  if (ready && authenticated) {
    return <Navigate replace to={ROUTE_PATHS.tokenize} />
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-10 sm:px-6">
      <div className="grid w-full gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <section className="grid content-center gap-5">
          <div className="grid gap-3">
            <p className="m-0 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              CarbX
            </p>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              One auth flow for wallet, email, and Google.
            </h1>
            <p className="m-0 max-w-xl text-base text-slate-600">
              Sign in with Privy, then continue to the Solana app. If a user has no
              Solana wallet, Privy will create a single embedded Solana wallet on login.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => login({ loginMethods: ['wallet'], walletChainType: 'solana-only' })}>
              <Wallet className="size-4" />
              Continue with Wallet
            </Button>
            <Button onClick={() => login({ loginMethods: ['email'] })} variant="outline">
              Continue with Email
            </Button>
            <Button onClick={() => login({ loginMethods: ['google'] })} variant="outline">
              Continue with Google
            </Button>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Current user state</CardTitle>
            <CardDescription>
              Connected and linked wallets are shown separately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrivyAccountSummary />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
