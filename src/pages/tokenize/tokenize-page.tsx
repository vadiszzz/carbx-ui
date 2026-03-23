import { useState } from 'react'
import { Copy, Loader2, Mailbox, Sparkles, Wallet } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { usePuroAccountQuery } from '@/shared/api/puro/queries/use-puro-account-query'
import { Button } from '@/shared/ui/button'
import { PageHeader } from '@/shared/ui/page-header'
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
      <PageHeader
        description="Generate the Puro destination account used for tokenization intake, then route CORCs into the CarbX flow."
        kicker={
          <div className="page-kicker">
            <Sparkles className="size-3.5" />
            Tokenization intake
          </div>
        }
        title="Tokenize"
      />

      <Card>
        <CardHeader>
          <CardTitle>Get Puro account</CardTitle>
          <CardDescription>
            Log in once with Privy. If you use email or social first, link a
            Solana wallet before requesting a Puro destination account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="app-toolbar">
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
            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
                  <Mailbox className="size-4" />
                </div>
                <div className="grid flex-1 gap-1">
                  <p className="m-0 font-medium text-slate-900">
                    Puro destination account
                  </p>
                  <p className="m-0 text-muted-foreground">
                    Test environment only. Do not send real CORCs to this address.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                <p className="m-0 break-all font-medium text-slate-900">{puroAccountNumber}</p>
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
              <p className="mt-3 m-0 text-xs text-muted-foreground">
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
