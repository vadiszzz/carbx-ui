import { useState } from 'react'
import {
  ArrowRight,
  Banknote,
  Building2,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { usePuroAccountQuery } from '@/shared/api/puro/queries/use-puro-account-query'
import { DEMO_MODE } from '@/shared/config/demo-mode'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { OnramperOnrampDialog } from '@/shared/onramper/ui/onramper-onramp-dialog'

const MOCK_PURO_ACCOUNT = '45724d88-8755-481b-851a-9a94df76b77f'
const PURO_REGISTRY_URL = 'https://mypuro.purouat.com'

type DepositMode = 'credits' | 'cash'

const TABS: { value: DepositMode; label: string; description: string }[] = [
  {
    value: 'credits',
    label: 'Credits',
    description: 'Bring CORC carbon credits in from Puro Registry.',
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Top up your balance to buy credits on the marketplace.',
  },
]

export function DepositPage() {
  const [mode, setMode] = useState<DepositMode>('credits')
  const activeTab = TABS.find((tab) => tab.value === mode) ?? TABS[0]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Deposit</h2>
        <p className="text-sm text-muted-foreground">{activeTab.description}</p>
      </header>

      <ModeSwitcher mode={mode} onChange={setMode} />

      {mode === 'credits' ? <CreditsDeposit /> : <CashDeposit />}
    </div>
  )
}

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: DepositMode
  onChange: (mode: DepositMode) => void
}) {
  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {TABS.map((tab) => {
        const isActive = tab.value === mode
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-card text-foreground shadow-card'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

type StepState = 'pending' | 'active' | 'done'

function CreditsDeposit() {
  const [copied, setCopied] = useState(false)
  const [mockCreating, setMockCreating] = useState(false)
  const [mockCreated, setMockCreated] = useState(false)
  const { authenticated, login, linkWallet } = usePrivy()
  const { hasSolanaWallet } = usePrivyAuth()
  const puroAccountQuery = usePuroAccountQuery()

  const realAccount = puroAccountQuery.data?.puroAccountNumber ?? ''
  const puroAccountNumber = DEMO_MODE
    ? mockCreated
      ? MOCK_PURO_ACCOUNT
      : ''
    : realAccount
  const hasPuroAccount = Boolean(puroAccountNumber)
  const isCreating = DEMO_MODE ? mockCreating : puroAccountQuery.isFetching

  const ready = authenticated && hasSolanaWallet

  async function handleCreateAccount() {
    if (DEMO_MODE) {
      setMockCreating(true)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setMockCreated(true)
      setMockCreating(false)
      return
    }
    await puroAccountQuery.refetch()
  }

  async function handleCopy() {
    if (!puroAccountNumber) return
    await navigator.clipboard.writeText(puroAccountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const step1State: StepState = hasPuroAccount ? 'done' : 'active'
  const step2State: StepState = hasPuroAccount ? 'active' : 'pending'
  const step3State: StepState = 'pending'

  return (
    <div className="flex flex-col gap-5">
      {!authenticated && (
        <Notice
          title="Sign in first"
          description="You need to be signed in to start the credits deposit."
          ctaLabel="Sign in"
          onClick={() => login()}
        />
      )}

      {authenticated && !hasSolanaWallet && (
        <Notice
          title="Link a Solana wallet"
          description="Deposited credits land in your linked Solana wallet."
          ctaLabel={
            <span className="inline-flex items-center gap-2">
              <Wallet className="size-4" /> Link wallet
            </span>
          }
          onClick={() => linkWallet({ walletChainType: 'solana-only' })}
        />
      )}

      <StepCard number={1} title="Create your destination account at Puro" state={ready ? step1State : 'pending'}>
        <p className="text-sm text-muted-foreground">
          CarbX creates a unique account at Puro Registry tied to your wallet.
          You'll send your credits to this account number from your own Puro
          account in the next step.
        </p>

        {ready && step1State === 'active' && (
          <>
            <button
              type="button"
              disabled={isCreating}
              onClick={() => void handleCreateAccount()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  Create destination account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
            {puroAccountQuery.isError && !DEMO_MODE && (
              <p className="mt-2 text-sm text-destructive">
                Couldn't create the account. Try again.
              </p>
            )}
          </>
        )}

        {step1State === 'done' && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your destination account number
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2.5">
              <code className="num truncate text-sm font-medium text-foreground">
                {puroAccountNumber}
              </code>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </StepCard>

      <StepCard number={2} title="Transfer your credits inside Puro Registry" state={ready ? step2State : 'pending'}>
        <p className="text-sm text-muted-foreground">
          Open Puro, sign in to your own account, and send credits to the
          destination above.
        </p>

        {step2State === 'active' && (
          <>
            <a
              href={PURO_REGISTRY_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Open Puro Registry
              <ExternalLink className="size-4" />
            </a>

            <ol className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <Tip n={1}>Sign in with your Puro account credentials.</Tip>
              <Tip n={2}>Go to <strong className="text-foreground">Transactions → New Transfer</strong>.</Tip>
              <Tip n={3}>Paste the destination account number from step 1 into the recipient field.</Tip>
              <Tip n={4}>Pick the vintage and amount you want to deposit.</Tip>
              <Tip n={5}>Confirm the transfer.</Tip>
            </ol>

            <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Currently pointing at Puro's <strong>test environment</strong> —
              do not transfer real credits. Production support coming soon.
            </p>
          </>
        )}
      </StepCard>

      <StepCard number={3} title="Credits land in your Holdings" state={ready ? step3State : 'pending'}>
        <p className="text-sm text-muted-foreground">
          Once Puro confirms the transfer, CarbX detects it and mints on-chain
          credits to your wallet. Track progress in{' '}
          <Link
            to={ROUTE_PATHS.portfolioActivity}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Activity
          </Link>
          .
        </p>
      </StepCard>
    </div>
  )
}

type CashMethod = {
  id: 'card' | 'bank' | 'wire'
  label: string
  description: string
  icon: React.ReactNode
  badge?: string
}

const CASH_METHODS: CashMethod[] = [
  {
    id: 'card',
    label: 'Card payment',
    description: 'Visa, Mastercard, or Amex. Funds land in seconds.',
    icon: <CreditCard className="size-4" />,
    badge: 'Fastest',
  },
  {
    id: 'bank',
    label: 'Bank transfer',
    description: 'ACH or SEPA from your verified bank account.',
    icon: <Landmark className="size-4" />,
  },
  {
    id: 'wire',
    label: 'Wire transfer',
    description: 'Best for larger amounts. Settles within 1–2 business days.',
    icon: <Building2 className="size-4" />,
  },
]

function CashDeposit() {
  const [onrampOpen, setOnrampOpen] = useState(false)
  const { authenticated, login } = usePrivy()
  const { walletAddress } = usePrivyAuth()

  if (!authenticated) {
    return (
      <Notice
        title="Sign in first"
        description="You need to be signed in to deposit cash."
        ctaLabel="Sign in"
        onClick={() => login()}
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Banknote className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Choose how to add cash
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a method below — Onramper handles the rate, identity check,
              and settlement straight to your linked Solana wallet.
            </p>
          </div>
        </div>

        <ul className="mt-5 grid gap-2">
          {CASH_METHODS.map((method) => (
            <li key={method.id}>
              <button
                type="button"
                disabled={!walletAddress}
                onClick={() => setOnrampOpen(true)}
                className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-border-strong hover:bg-muted disabled:opacity-50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {method.label}
                      {method.badge ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                          {method.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {method.description}
                    </div>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            </li>
          ))}
        </ul>

        {!walletAddress && (
          <p className="mt-4 text-xs text-muted-foreground">
            Link a Solana wallet first so we know where to settle the funds.
          </p>
        )}
      </div>

      <OnramperOnrampDialog
        onClose={() => setOnrampOpen(false)}
        open={onrampOpen}
        walletAddress={walletAddress}
      />
    </>
  )
}

function StepCard({
  number,
  title,
  state,
  children,
}: {
  number: number
  title: string
  state: StepState
  children: React.ReactNode
}) {
  const isPending = state === 'pending'
  const isActive = state === 'active'
  const isDone = state === 'done'

  return (
    <div
      className={[
        'rounded-xl border border-border bg-card p-6 shadow-card transition-opacity',
        isActive ? 'ring-1 ring-primary' : '',
        isPending ? 'opacity-50' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div
          className={[
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            isDone || isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          ].join(' ')}
        >
          {isDone ? <Check className="size-4" /> : number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Notice({
  title,
  description,
  ctaLabel,
  onClick,
}: {
  title: string
  description: string
  ctaLabel: React.ReactNode
  onClick: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {ctaLabel}
      </button>
    </div>
  )
}

function Tip({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="num inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}
