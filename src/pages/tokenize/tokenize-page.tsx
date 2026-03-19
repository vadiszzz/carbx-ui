import { useState } from 'react'
import { Copy, Loader2, Wallet } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { usePuroAccountQuery } from '@/shared/api/puro/queries/use-puro-account-query'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'

export function TokenizePage() {
  const [copied, setCopied] = useState(false)
  const { authenticated, login, linkWallet } = usePrivy()
  const { hasSolanaWallet } = usePrivyAuth()
  const puroAccountQuery = usePuroAccountQuery()

  const puroAccountNumber = puroAccountQuery.data?.puroAccountNumber ?? ''
  const hasPuroAccount = Boolean(puroAccountNumber)

  async function handleGetPuroAccount() {
    await puroAccountQuery.refetch()
  }

  async function handleCopy() {
    if (!puroAccountNumber) return
    await navigator.clipboard.writeText(puroAccountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <h2 className="m-0 text-2xl font-semibold tracking-tight">Tokenize</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Puro account</CardTitle>
          <CardDescription>
            Log in once with Privy. If you use email or social first, link a
            Solana wallet before requesting a Puro destination account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {!authenticated ? (
              <Button onClick={() => login()}>
                Continue with Login
              </Button>
            ) : null}

            {authenticated && !hasSolanaWallet ? (
              <Button
                onClick={() => linkWallet({ walletChainType: 'solana-only' })}
                variant="outline"
              >
                <Wallet className="size-4" />
                Link Solana wallet
              </Button>
            ) : null}

            {authenticated && !hasPuroAccount ? (
              <Button
                disabled={puroAccountQuery.isFetching}
                onClick={() => void handleGetPuroAccount()}
              >
                Get puro account
              </Button>
            ) : null}
          </div>

          {!authenticated ? (
            <p className="m-0 text-sm text-muted-foreground">
              Open Login and choose wallet, email, or Google.
            </p>
          ) : null}
          {authenticated && !hasSolanaWallet ? (
            <p className="m-0 text-sm text-muted-foreground">
              Optional: link a Solana wallet to keep wallet-based flows available in the app.
            </p>
          ) : null}

          {puroAccountQuery.isFetching && !hasPuroAccount ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading puro account...
            </div>
          ) : null}

          {hasPuroAccount ? (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="m-0 text-muted-foreground">
                Puro destination account. !!!DO NOT SEND REAL CORCS. ONLY PURO UAT ENV (TEST ENVIRONMENT)!!!
              </p>
              <div className="mt-1 flex items-center gap-1">
                <p className="m-0 break-all font-medium">{puroAccountNumber}</p>
                <Button
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={handleCopy}
                  title="Copy address"
                  variant="ghost"
                >
                  <Copy className="size-3.5" />
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="mt-2 m-0 text-xs text-muted-foreground">
                Send your CORC to this address to complete tokenization.
              </p>
            </div>
          ) : null}

          {puroAccountQuery.isError ? (
            <p className="m-0 text-sm text-destructive">
              Failed to fetch puro account. Try again.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
