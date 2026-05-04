import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Landmark,
  Leaf,
  Loader2,
  Wallet,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePrivy } from '@privy-io/react-auth'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { qist_puro } from 'qist-puro-sdk'
import { AccountId } from 'qist-puro-sdk/lib/qist-puro/functions/getters/getSpecificAccounts'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { usePuroAccountQuery } from '@/shared/api/puro/queries/use-puro-account-query'
import { fetchSponsoredTransaction } from '@/shared/api/sponsored-transaction/requests'
import { SPONSORED_TX_TYPES } from '@/shared/api/sponsored-transaction/types'
import { useUsdcBalanceQuery } from '@/shared/api/solana/queries/use-usdc-balance-query'
import { DEMO_MODE } from '@/shared/config/demo-mode'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import {
  CONFIG_PUBKEY,
  MINTER_PDA,
  RPC_URL,
  SOLANA_CHAIN,
} from '@/shared/constants/solana'
import {
  formatVintageTokenAmount,
  getVintageTokens,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import {
  base64ToBytes,
  isValidSolanaAddress,
  parseLocalizedNumber,
  parseUiAmountToAtomic,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import { useToast } from '@/shared/ui/toast-provider'
import {
  MOCK_HOLDINGS,
  MOCK_REGISTRY_META,
} from '@/pages/tokens/lib/mock-holdings'
import {
  detectProjectType,
  extractVintage,
  formatProjectName,
} from '@/pages/marketplace/lib/listing-meta'
import type { VintageRegistryMeta } from '@/pages/tokens/model'

type WithdrawMode = 'credits' | 'cash'
type CreditDestination = 'puro' | 'wallet'

const TABS: { value: WithdrawMode; label: string; description: string }[] = [
  {
    value: 'credits',
    label: 'Credits',
    description:
      'Send carbon credits back to Puro Registry or to an external Solana wallet.',
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Withdraw your balance to a bank account or external wallet.',
  },
]

async function fetchVintageRegistryMeta(
  connection: Connection
): Promise<VintageRegistryMeta[]> {
  if (DEMO_MODE) return MOCK_REGISTRY_META

  const rawAccounts = await qist_puro.functions.getters.getSpecificAccounts(
    AccountId.VintageRegistry,
    connection
  )

  return rawAccounts
    .map((rawAccount) => {
      const account =
        rawAccount && typeof rawAccount === 'object' && 'account' in rawAccount
          ? (rawAccount as { account?: unknown }).account
          : rawAccount

      if (!account || typeof account !== 'object') return null

      const tokenMintRaw = (account as { tokenMint?: unknown }).tokenMint
      const tokenMint =
        tokenMintRaw instanceof PublicKey
          ? tokenMintRaw.toBase58()
          : typeof tokenMintRaw === 'string'
            ? tokenMintRaw
            : null

      const companyIdRaw = (account as { companyId?: unknown }).companyId
      const yearRaw = (account as { year?: unknown }).year

      const companyIdBytes = Array.isArray(companyIdRaw)
        ? companyIdRaw
        : companyIdRaw instanceof Uint8Array
          ? Array.from(companyIdRaw)
          : null

      const year = typeof yearRaw === 'number' ? yearRaw : null

      if (!tokenMint || !companyIdBytes || !year) return null

      const companyId32 = qist_puro.helpers
        .decodeFixedBytes(companyIdBytes)
        .replaceAll(String.fromCharCode(0), '')

      if (!companyId32) return null

      return { tokenMint, companyId32, year } satisfies VintageRegistryMeta
    })
    .filter((item): item is VintageRegistryMeta => item !== null)
}

export function WithdrawPage() {
  const [mode, setMode] = useState<WithdrawMode>('credits')
  const activeTab = TABS.find((tab) => tab.value === mode) ?? TABS[0]

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Withdraw
        </h2>
        <p className="text-sm text-muted-foreground">{activeTab.description}</p>
      </header>

      <ModeSwitcher mode={mode} onChange={setMode} />

      {mode === 'credits' ? <CreditsWithdraw /> : <CashWithdraw />}
    </div>
  )
}

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: WithdrawMode
  onChange: (mode: WithdrawMode) => void
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

function CreditsWithdraw() {
  const { connectWallet } = usePrivy()
  const { connectedWallet, hasSolanaWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const { showToast, updateToast } = useToast()
  const queryClient = useQueryClient()
  const puroAccountQuery = usePuroAccountQuery()
  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), [])
  const publicKey = walletAddress && !DEMO_MODE ? new PublicKey(walletAddress) : null

  const holdingsQuery = useQuery<VintageToken[], Error>({
    queryKey: ['tokens', 'vintage', walletAddress],
    queryFn: () => {
      if (DEMO_MODE) return Promise.resolve(MOCK_HOLDINGS)

      return getVintageTokens({
        ownerAddress: walletAddress ?? '',
        rpcUrl: RPC_URL,
        minterPda: MINTER_PDA,
      })
    },
    enabled: Boolean(walletAddress),
  })

  const registryMetaQuery = useQuery<VintageRegistryMeta[], Error>({
    queryKey: ['tokens', 'vintage-registry'],
    queryFn: () => fetchVintageRegistryMeta(connection),
    enabled: Boolean(walletAddress),
  })

  const holdings = useMemo(() => holdingsQuery.data ?? [], [holdingsQuery.data])
  const [destination, setDestination] = useState<CreditDestination>('puro')
  const [selectedMint, setSelectedMint] = useState<string>(
    holdings[0]?.mint ?? ''
  )
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedHolding = useMemo<VintageToken | null>(
    () => holdings.find((h) => h.mint === selectedMint) ?? null,
    [holdings, selectedMint]
  )
  const available = parseAvailable(selectedHolding)
  const amountNum = parseAmount(amount)
  const exceedsAvailable = amountNum > available

  const recipientValid =
    destination === 'puro' ? true : isValidSolanaAddress(recipient.trim())
  const canSubmit =
    !!selectedHolding && amountNum > 0 && !exceedsAvailable && recipientValid

  useEffect(() => {
    if (!selectedMint && holdings[0]?.mint) {
      setSelectedMint(holdings[0].mint)
    }
  }, [holdings, selectedMint])

  if (!hasSolanaWallet) {
    return (
      <Notice
        title="Link a Solana wallet"
        description="Credits are held and withdrawn from your linked Solana wallet."
        ctaLabel={
          <span className="inline-flex items-center gap-2">
            <Wallet className="size-4" /> Link wallet
          </span>
        }
        onClick={() => connectWallet({ walletChainType: 'solana-only' })}
      />
    )
  }

  if (holdingsQuery.isLoading) {
    return (
      <Section
        title="Loading credits"
        description="Fetching the credits available in your connected wallet."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading wallet holdings...
        </div>
      </Section>
    )
  }

  if (holdingsQuery.isError) {
    return (
      <Section
        title="Couldn’t load credits"
        description={holdingsQuery.error.message}
      >
        <button
          type="button"
          onClick={() => void holdingsQuery.refetch()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateArrowIcon />
          Retry
        </button>
      </Section>
    )
  }

  async function sendSponsoredTransaction(input: {
    txType:
      | typeof SPONSORED_TX_TYPES.BURN_VINTAGE
      | typeof SPONSORED_TX_TYPES.TRANSFER_TOKEN
    amount: number
    puroUserUuid?: string
    tokenMint?: string
    recipient?: string
    registry?: string
  }) {
    if (!publicKey) {
      throw new Error('Wallet is not connected')
    }

    if (!connectedWallet) {
      throw new Error('No connected Privy wallet found')
    }

    const sponsoredTx = await fetchSponsoredTransaction({
      txType: input.txType,
      user: publicKey.toBase58(),
      amount: input.amount,
      puroUserUuid: input.puroUserUuid,
      tokenMint: input.tokenMint,
      recipient: input.recipient,
      registry: input.registry,
    })

    if (sponsoredTx.errorMessage) {
      throw new Error(sponsoredTx.errorMessage)
    }

    if (!sponsoredTx.tx) {
      throw new Error('Sponsored transaction payload is empty')
    }

    const signatureResult = await signAndSendTransaction({
      transaction: base64ToBytes(sponsoredTx.tx),
      wallet: connectedWallet,
      chain: SOLANA_CHAIN,
      options: {
        skipPreflight: true,
      },
    })

    const signature = bs58.encode(signatureResult.signature)
    await waitForTransactionConfirmation(connection, signature)

    return signature
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
        <h3 className="text-lg font-semibold text-foreground">
          No credits to withdraw
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Once you hold credits in your wallet, you can send them back to Puro
          or to an external Solana wallet from here.
        </p>
      </div>
    )
  }

  async function handleSubmit() {
    if (!canSubmit || !selectedHolding) return

    if (DEMO_MODE) {
      setIsSubmitting(true)
      window.setTimeout(() => {
        setIsSubmitting(false)
        showToast({
          type: 'info',
          text: 'Mock mode: real withdrawal disabled. Wire backend to enable.',
          durationMs: 5000,
        })
      }, 600)
      return
    }

    if (!publicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    setIsSubmitting(true)
    const toastId = showToast({
      type: 'info',
      text:
        destination === 'puro'
          ? 'Building detokenize transaction...'
          : 'Building withdraw transaction...',
    })

    try {
      if (destination === 'wallet') {
        const trimmedRecipient = recipient.trim()
        if (!isValidSolanaAddress(trimmedRecipient)) {
          throw new Error('Recipient must be a valid Solana address')
        }

        const decimals =
          typeof selectedHolding.tokenInfo?.decimals === 'number'
            ? selectedHolding.tokenInfo.decimals
            : 0

        const atomicAmount = parseUiAmountToAtomic(amount, decimals)
        if (atomicAmount <= 0) {
          throw new Error('Amount must be greater than zero')
        }

        const availableBalance = selectedHolding.tokenInfo?.balance
        if (
          typeof availableBalance === 'number' &&
          Number.isFinite(availableBalance) &&
          atomicAmount > availableBalance
        ) {
          throw new Error('Amount exceeds available token balance')
        }

        updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
        const signature = await sendSponsoredTransaction({
          txType: SPONSORED_TX_TYPES.TRANSFER_TOKEN,
          amount: atomicAmount,
          tokenMint: selectedHolding.mint,
          recipient: trimmedRecipient,
        })

        updateToast(toastId, {
          type: 'success',
          text: 'Withdraw transaction confirmed',
          signature,
          durationMs: 6000,
        })
      } else {
        let detokenizeAmount: number
        try {
          detokenizeAmount = parseLocalizedNumber(amount)
        } catch {
          detokenizeAmount = Number.NaN
        }

        if (!Number.isFinite(detokenizeAmount) || detokenizeAmount <= 0) {
          throw new Error('Amount must be a positive number')
        }

        if (detokenizeAmount > available) {
          throw new Error('Amount exceeds available token balance')
        }

        const registryMeta = (registryMetaQuery.data ?? []).find(
          (registry) => registry.tokenMint === selectedHolding.mint
        )
        if (!registryMeta) {
          throw new Error('Registry data for selected token was not found')
        }

        const puroAccountResult = await puroAccountQuery.refetch()
        const puroAccountNumber = puroAccountResult.data?.puroAccountNumber?.trim() ?? ''
        if (!puroAccountNumber) {
          throw new Error('Puro destination account was not found')
        }

        const registry = qist_puro.helpers.findRegistryPda(
          CONFIG_PUBKEY,
          registryMeta.companyId32,
          registryMeta.year
        )

        updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
        const signature = await sendSponsoredTransaction({
          txType: SPONSORED_TX_TYPES.BURN_VINTAGE,
          amount: detokenizeAmount,
          puroUserUuid: puroAccountNumber,
          registry: registry.toBase58(),
        })

        updateToast(toastId, {
          type: 'success',
          text: 'Detokenize transaction confirmed',
          signature,
          durationMs: 6000,
        })
      }

      setAmount('')
      setRecipient('')
      await holdingsQuery.refetch()
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PURO_ACCOUNT })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Withdrawal failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-5">
      <Section
        title="What to withdraw"
        description="Pick the carbon credit and how many you want to send."
      >
        <div className="flex flex-col gap-4">
          <div>
            <Label>Credit</Label>
            <select
              value={selectedMint}
              onChange={(event) => {
                setSelectedMint(event.target.value)
                setAmount('')
              }}
              className="mt-1.5 w-full rounded-lg border border-border-strong bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              {holdings.map((holding) => {
                const projectName = formatProjectName(
                  holding,
                  holding.symbol ?? 'Carbon credit'
                )
                const vintage = extractVintage(holding.name)
                return (
                  <option key={holding.mint} value={holding.mint}>
                    {projectName}
                    {vintage ? ` · Vintage ${vintage}` : ''} · {formatVintageTokenAmount(holding)} available
                  </option>
                )
              })}
            </select>
            {selectedHolding && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {detectProjectType(selectedHolding.name)}
                </span>
                <span>
                  Available: <span className="num text-foreground">{formatVintageTokenAmount(selectedHolding)}</span> credits
                </span>
              </div>
            )}
          </div>

          <div>
            <Label>Amount (credits)</Label>
            <div className="relative mt-1.5">
              <input
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                className="num w-full rounded-lg border border-border-strong bg-card py-2.5 pl-3 pr-20 text-base font-semibold text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setAmount(String(available))}
                disabled={available <= 0}
                className="absolute inset-y-1 right-1 inline-flex items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                Max
              </button>
            </div>
            {exceedsAvailable && (
              <p className="mt-1 text-xs text-rose-700">
                You only have {available.toLocaleString()} credits available.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Where to send"
        description="Pick a destination for the withdrawal."
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <DestinationCard
            active={destination === 'puro'}
            onClick={() => setDestination('puro')}
            icon={<Leaf className="size-4" />}
            label="Back to Puro Registry"
            description="Detokenize. The on-chain credits are burned and you get standard CORC credits back in your Puro account."
          />
          <DestinationCard
            active={destination === 'wallet'}
            onClick={() => setDestination('wallet')}
            icon={<Wallet className="size-4" />}
            label="To an external wallet"
            description="Send the on-chain tokens to any Solana wallet. They stay tokenized."
          />
        </div>

        {destination === 'wallet' && (
          <div className="mt-4">
            <Label>Recipient Solana address</Label>
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="Solana wallet address"
              className="mt-1.5 w-full rounded-lg border border-border-strong bg-card px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary"
            />
            {recipient && !recipientValid && (
              <p className="mt-1 text-xs text-rose-700">
                That doesn’t look like a valid Solana address.
              </p>
            )}
          </div>
        )}

        {destination === 'puro' && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Detokenization is permanent. The on-chain tokens are burned and
              the underlying CORC credits are credited back to your Puro
              account at{' '}
              <a
                href="https://mypuro.purouat.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 underline hover:no-underline"
              >
                Puro Registry <ExternalLink className="size-3" />
              </a>
              .
            </span>
          </div>
        )}
      </Section>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={() => void handleSubmit()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting
            </>
          ) : (
            <>
              {destination === 'puro' ? 'Detokenize' : 'Send to wallet'}
              <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

type CashOfframpMethod = {
  id: 'bank' | 'wallet'
  label: string
  description: string
  icon: React.ReactNode
}

const CASH_OFFRAMP_METHODS: CashOfframpMethod[] = [
  {
    id: 'bank',
    label: 'Bank account',
    description: 'Cash out to your verified bank via ACH or SEPA. 1–3 business days.',
    icon: <Landmark className="size-4" />,
  },
  {
    id: 'wallet',
    label: 'External wallet',
    description: 'Send your balance to any Solana address. Settles in seconds.',
    icon: <Wallet className="size-4" />,
  },
]

function CashWithdraw() {
  const { authenticated, login } = usePrivy()
  const { walletAddress } = usePrivyAuth()
  const usdcBalanceQuery = useUsdcBalanceQuery(walletAddress)
  const { showToast } = useToast()

  const available = usdcBalanceQuery.data ?? 0

  if (!authenticated) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-base font-semibold text-foreground">Sign in first</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You need to be signed in to withdraw cash.
        </p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in
        </button>
      </div>
    )
  }

  function handleMethod(method: CashOfframpMethod) {
    showToast({
      type: 'info',
      text: `Mock mode: ${method.label.toLowerCase()} offramp not wired. Onramper offramp will handle this for real.`,
      durationMs: 5000,
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Choose how to cash out
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Onramper handles the rate, identity check, and settlement to your
            destination.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Available
          </div>
          <div className="num text-2xl font-bold tracking-tight text-foreground">
            ${formatBalance(available)}
          </div>
        </div>
      </div>

      <ul className="mt-5 grid gap-2">
        {CASH_OFFRAMP_METHODS.map((method) => (
          <li key={method.id}>
            <button
              type="button"
              disabled={!walletAddress || available <= 0}
              onClick={() => handleMethod(method)}
              className="group flex w-full items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:border-border-strong hover:bg-muted disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-foreground">
                  {method.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {method.label}
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
          Link a Solana wallet first so we know where the funds are coming from.
        </p>
      )}
      {walletAddress && available <= 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Your balance is empty — there’s nothing to withdraw yet.
        </p>
      )}
    </div>
  )
}

function Section({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        ) : null}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function DestinationCard({
  active,
  onClick,
  icon,
  label,
  description,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors',
        active
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-background hover:border-border-strong hover:bg-muted',
      ].join(' ')}
    >
      <div
        className={[
          'flex size-8 items-center justify-center rounded-md',
          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        ].join(' ')}
      >
        {icon}
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
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

function RotateArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 11a9 9 0 0 1 15.55-5.36L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 13a9 9 0 0 1-15.55 5.36L3 16" />
    </svg>
  )
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : 0
}

function parseAvailable(token: VintageToken | null): number {
  if (!token?.tokenInfo) return 0
  const balance = (token.tokenInfo as { balance?: unknown }).balance
  if (typeof balance === 'number' && Number.isFinite(balance)) return balance
  const supply = (token.tokenInfo as { supply?: unknown }).supply
  if (typeof supply === 'string') {
    const parsed = Number(supply)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function formatBalance(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
