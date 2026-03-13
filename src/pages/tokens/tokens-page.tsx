import { useRef, useState } from 'react'
import axios from 'axios'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Transaction } from '@solana/web3.js'
import { qist_puro } from 'qist-puro-sdk'
import { createRetire } from '@/shared/api/retire/requests'
import {
  RETIRE_BENEFICIARY_TYPES,
  RETIRE_USAGE_TYPES,
  type CreateRetirePayload,
  type RetireBeneficiaryType,
  type RetireUsageType,
} from '@/shared/api/retire/types'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

type DasAsset = {
  id?: string
  authorities?: Array<{ address?: string }>
  content?: {
    metadata?: {
      name?: string | null
      symbol?: string | null
    }
    json_uri?: string | null
  }
  token_info?: {
    symbol?: string | null
    balance?: number | null
    decimals?: number | null
    ui_amount?: number | null
    uiAmount?: number | null
  } | null
}

type DasResponse = {
  result?: {
    items?: DasAsset[]
  }
}

type VintageToken = {
  mint: string
  name: string | null
  symbol: string | null
  uri: string | null
  tokenInfo: DasAsset['token_info']
}

type VintageRegistryMeta = {
  tokenMint: string
  companyId16: string
  year: number
}

type ToastType = 'info' | 'success' | 'error'
type ToastItem = {
  id: number
  type: ToastType
  text: string
  signature?: string
}

type RetireFormState = {
  beneficiaryName: string
  beneficiaryLocation: string
  beneficiaryType: RetireBeneficiaryType
  beneficiaryContactPersonEmail: string
  countryOfConsumption: string
  usageType: RetireUsageType
  consumptionPeriodStartDate: string
  consumptionPeriodEndDate: string
  beneficiaryHiddenUntil: string
  retirementPurpose: string
  offtakeAgreementId: string
}

const DEFAULT_MINTER_PDA = 'Dccf2hLZmCDsQypSTYab2E4rbDday4SEEYBV8KTiPMX'
const DEFAULT_CONFIG_PUBKEY = 'CLNJGG3sZ8cxuveemDw9D1tk18q3QCWLWAAwpXumPVY8'
const DEFAULT_RETIRE_FORM: RetireFormState = {
  beneficiaryName: '',
  beneficiaryLocation: '',
  beneficiaryType: RETIRE_BENEFICIARY_TYPES.END_CONSUMER,
  beneficiaryContactPersonEmail: '',
  countryOfConsumption: '',
  usageType: RETIRE_USAGE_TYPES.DISCLOSURE,
  consumptionPeriodStartDate: '',
  consumptionPeriodEndDate: '',
  beneficiaryHiddenUntil: '',
  retirementPurpose: '',
  offtakeAgreementId: '',
}
const RETIRE_BENEFICIARY_OPTIONS: Array<{
  value: RetireBeneficiaryType
  label: string
}> = [
  { value: RETIRE_BENEFICIARY_TYPES.END_CONSUMER, label: 'End consumer' },
  { value: RETIRE_BENEFICIARY_TYPES.SUPPLIER, label: 'Supplier' },
]
const RETIRE_USAGE_OPTIONS: Array<{ value: RetireUsageType; label: string }> = [
  { value: RETIRE_USAGE_TYPES.BUNDLED_WITH_PRODUCT_OR_SERVICE, label: 'Bundled product/service' },
  { value: RETIRE_USAGE_TYPES.DISCLOSURE, label: 'Disclosure' },
  { value: RETIRE_USAGE_TYPES.GENERIC_COMPENSATION, label: 'Generic compensation' },
  { value: RETIRE_USAGE_TYPES.OTHER, label: 'Other' },
  { value: RETIRE_USAGE_TYPES.SPECIFIC_ACTIVITY_LIKE_FLIGHTS, label: 'Specific activity (flights)' },
  { value: RETIRE_USAGE_TYPES.SUPPORT, label: 'Support' },
]

const MINTER_PDA = import.meta.env.VITE_MINTER_PDA ?? DEFAULT_MINTER_PDA
const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://api.devnet.solana.com'
const CONFIG_PUBKEY = new PublicKey(
  import.meta.env.VITE_CONFIG_PUBKEY ?? DEFAULT_CONFIG_PUBKEY
)
const SOLSCAN_CLUSTER = RPC_URL.includes('devnet')
  ? 'devnet'
  : RPC_URL.includes('testnet')
    ? 'testnet'
    : null

async function getVintageTokens(ownerAddress: string): Promise<VintageToken[]> {
  const body = {
    jsonrpc: '2.0',
    id: 'vintage-assets',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress,
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showNativeBalance: false,
      },
    },
  }

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as DasResponse
  const items = data.result?.items ?? []

  const ours = items.filter(
    (asset) =>
      Array.isArray(asset.authorities) &&
      asset.authorities.some((authority) => authority?.address === MINTER_PDA)
  )

  return ours.map((asset) => ({
    mint: asset.id ?? '-',
    name: asset.content?.metadata?.name ?? asset.content?.metadata?.symbol ?? null,
    symbol: asset.content?.metadata?.symbol ?? asset.token_info?.symbol ?? null,
    uri: asset.content?.json_uri ?? null,
    tokenInfo: asset.token_info ?? null,
  }))
}

function formatAmount(token: VintageToken) {
  const uiAmount = token.tokenInfo?.ui_amount ?? token.tokenInfo?.uiAmount
  if (typeof uiAmount === 'number') return String(uiAmount)

  const balance = token.tokenInfo?.balance
  const decimals = token.tokenInfo?.decimals
  if (typeof balance === 'number' && typeof decimals === 'number') {
    return String(balance / 10 ** decimals)
  }

  return '-'
}

function formatMint(mint: string) {
  if (mint.length <= 14) return mint
  return `${mint.slice(0, 6)}...${mint.slice(-6)}`
}

function getSolscanTokenUrl(mint: string) {
  if (SOLSCAN_CLUSTER) {
    return `https://solscan.io/token/${mint}?cluster=${SOLSCAN_CLUSTER}`
  }
  return `https://solscan.io/token/${mint}`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const candidate = data as { message?: unknown; errors?: unknown }
      if (Array.isArray(candidate.errors)) {
        const joined = candidate.errors
          .filter((item): item is string => typeof item === 'string')
          .join(', ')
        if (joined) return joined
      }
      if (typeof candidate.message === 'string' && candidate.message.length > 0) {
        return candidate.message
      }
    }
  }

  return error instanceof Error ? error.message : fallback
}

export function TokensPage() {
  const { connection } = useConnection()
  const { connected, publicKey, sendTransaction } = useWallet()

  const ownerAddress = publicKey?.toBase58() ?? ''

  const vintageTokensQuery = useQuery<VintageToken[], Error>({
    queryKey: ['tokens', 'vintage', ownerAddress],
    queryFn: () => getVintageTokens(ownerAddress),
    enabled: Boolean(ownerAddress),
  })
  const registryMetaQuery = useQuery<VintageRegistryMeta[], Error>({
    queryKey: ['tokens', 'vintage-registry'],
    queryFn: async () => {
      const rawAccounts = await qist_puro.functions.getters.getSpecificAccounts(
        qist_puro.functions.getters.AccountId.VintageRegistry,
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

          const companyId16 = qist_puro.helpers
            .decodeFixedBytes16(companyIdBytes)
            .replaceAll(String.fromCharCode(0), '')

          if (!companyId16) return null

          return {
            tokenMint,
            companyId16,
            year,
          } satisfies VintageRegistryMeta
        })
        .filter((item): item is VintageRegistryMeta => item !== null)
    },
    enabled: connected,
  })

  const [burnToken, setBurnToken] = useState<VintageToken | null>(null)
  const [burnAmount, setBurnAmount] = useState('')
  const [puroUserUuid, setPuroUserUuid] = useState('')
  const [isBurning, setIsBurning] = useState(false)
  const [retireToken, setRetireToken] = useState<VintageToken | null>(null)
  const [retireAmount, setRetireAmount] = useState('')
  const [retireForm, setRetireForm] = useState<RetireFormState>(
    () => ({ ...DEFAULT_RETIRE_FORM })
  )
  const [isRetiring, setIsRetiring] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const toastIdRef = useRef(1)

  function createToast(type: ToastType, text: string, autoCloseMs?: number) {
    const id = toastIdRef.current++
    setToasts((prev) => [...prev, { id, type, text }])
    if (autoCloseMs) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
      }, autoCloseMs)
    }
    return id
  }

  function updateToast(
    id: number,
    patch: Partial<ToastItem>,
    autoCloseMs?: number
  ) {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
    if (autoCloseMs) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id))
      }, autoCloseMs)
    }
  }

  async function handleBurnSubmit() {
    if (!burnToken) return
    if (!publicKey) {
      createToast('error', 'Wallet is not connected', 5000)
      return
    }

    const amount = Number(burnAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      createToast('error', 'Amount must be a positive number', 5000)
      return
    }

    if (!puroUserUuid.trim()) {
      createToast('error', 'Puro user address is required', 5000)
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === burnToken.mint
    )
    if (!tokenRegistry) {
      createToast(
        'error',
        'Registry data for selected token was not found',
        7000
      )
      return
    }

    setIsBurning(true)
    const toastId = createToast('info', 'Building burn transaction...')

    try {
      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId16,
        tokenRegistry.year
      )

      const burnResult = await qist_puro.functions.burnVintage({
        connection,
        accounts: {
          user: publicKey,
          config: CONFIG_PUBKEY,
          registry,
        },
        args: {
          amount,
          puroUserUuid: puroUserUuid.trim(),
        },
      })

      if (burnResult.instructions.length === 0) {
        throw new Error('Burn SDK returned empty instructions')
      }

      const transaction = new Transaction().add(...burnResult.instructions)
      transaction.feePayer = publicKey

      const { context, value } = await connection.getLatestBlockhashAndContext()
      transaction.recentBlockhash = value.blockhash

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })

      const signature = await sendTransaction(transaction, connection, {
        signers: burnResult.signers,
        skipPreflight: true,
        minContextSlot: context.slot,
      })

      await connection.confirmTransaction(
        {
          blockhash: value.blockhash,
          lastValidBlockHeight: value.lastValidBlockHeight,
          signature,
        },
        'confirmed'
      )

      updateToast(
        toastId,
        {
          type: 'success',
          text: 'Transaction confirmed',
          signature,
        },
        6000
      )

      setBurnToken(null)
      setBurnAmount('')
      setPuroUserUuid('')
      await vintageTokensQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Burn failed'
      updateToast(toastId, { type: 'error', text: message }, 7000)
    } finally {
      setIsBurning(false)
    }
  }

  async function handleRetireSubmit() {
    if (!retireToken) return
    if (!publicKey) {
      createToast('error', 'Wallet is not connected', 5000)
      return
    }

    const amount = Number(retireAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      createToast('error', 'Amount must be a positive number', 5000)
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === retireToken.mint
    )
    if (!tokenRegistry) {
      createToast(
        'error',
        'Registry data for selected token was not found',
        7000
      )
      return
    }

    setIsRetiring(true)
    const toastId = createToast('info', 'Creating retire request...')

    try {
      const payload: CreateRetirePayload = {
        beneficiaryName: retireForm.beneficiaryName.trim(),
        beneficiaryLocation: retireForm.beneficiaryLocation.trim(),
        beneficiaryType: retireForm.beneficiaryType,
        beneficiaryContactPersonEmail:
          retireForm.beneficiaryContactPersonEmail.trim(),
        countryOfConsumption: retireForm.countryOfConsumption.trim(),
        usageType: retireForm.usageType,
        consumptionPeriodStartDate: retireForm.consumptionPeriodStartDate.trim(),
        consumptionPeriodEndDate: retireForm.consumptionPeriodEndDate.trim(),
        beneficiaryHiddenUntil: retireForm.beneficiaryHiddenUntil.trim() || null,
        retirementPurpose: retireForm.retirementPurpose.trim(),
        offtakeAgreementId: retireForm.offtakeAgreementId.trim() || null,
        solanaUserWallet: publicKey.toBase58(),
      }
      const retireResponse = await createRetire(payload)

      updateToast(
        toastId,
        { type: 'info', text: 'Building retire transaction...' }
      )

      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId16,
        tokenRegistry.year
      )

      const retireResult = await qist_puro.functions.retireVintage({
        connection,
        accounts: {
          user: publicKey,
          config: CONFIG_PUBKEY,
          registry,
        },
        args: {
          amount,
          carbxRetireUuid: retireResponse.carbxRetireUuid,
        },
      })

      if (retireResult.instructions.length === 0) {
        throw new Error('Retire SDK returned empty instructions')
      }

      const transaction = new Transaction().add(...retireResult.instructions)
      transaction.feePayer = publicKey

      const { context, value } = await connection.getLatestBlockhashAndContext()
      transaction.recentBlockhash = value.blockhash

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })

      const signature = await sendTransaction(transaction, connection, {
        signers: retireResult.signers,
        skipPreflight: true,
        minContextSlot: context.slot,
      })

      await connection.confirmTransaction(
        {
          blockhash: value.blockhash,
          lastValidBlockHeight: value.lastValidBlockHeight,
          signature,
        },
        'confirmed'
      )

      updateToast(
        toastId,
        {
          type: 'success',
          text: 'Retire transaction confirmed',
          signature,
        },
        6000
      )

      setRetireToken(null)
      setRetireAmount('')
      setRetireForm({ ...DEFAULT_RETIRE_FORM })
      await vintageTokensQuery.refetch()
    } catch (error) {
      updateToast(
        toastId,
        { type: 'error', text: getErrorMessage(error, 'Retire failed') },
        7000
      )
    } finally {
      setIsRetiring(false)
    }
  }

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <h2 className="m-0 text-2xl font-semibold tracking-tight">Tokens</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tokenized CORC in your wallet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {!connected ? (
            <div className="grid gap-2">
              <div className="wallet-connect">
                <WalletMultiButton />
              </div>
              <p className="m-0 text-sm text-muted-foreground">
                Connect wallet to load tokens.
              </p>
            </div>
          ) : null}

          {connected && !ownerAddress ? (
            <p className="m-0 text-sm text-muted-foreground">
              Waiting for wallet public key...
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button
              disabled={!ownerAddress || vintageTokensQuery.isFetching}
              onClick={() => void vintageTokensQuery.refetch()}
              variant="outline"
            >
              {vintageTokensQuery.isFetching ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mint</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ownerAddress && vintageTokensQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading tokens...
                  </TableCell>
                </TableRow>
              ) : null}

              {ownerAddress && vintageTokensQuery.isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-destructive">
                    Failed to load tokens: {vintageTokensQuery.error.message}
                  </TableCell>
                </TableRow>
              ) : null}

              {ownerAddress &&
              !vintageTokensQuery.isLoading &&
              !vintageTokensQuery.isError &&
              (vintageTokensQuery.data?.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No tokens found for this wallet and minter.
                  </TableCell>
                </TableRow>
              ) : null}

              {(vintageTokensQuery.data ?? []).map((token) => (
                <TableRow key={token.mint}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMint(token.mint)}</span>
                      <Button asChild size="xs" variant="ghost">
                        <a
                          href={getSolscanTokenUrl(token.mint)}
                          rel="noreferrer"
                          target="_blank"
                          title="Open in Solscan"
                        >
                          <ExternalLink className="size-3.5" />
                          <span className="sr-only">Open in Solscan</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{token.name ?? '-'}</TableCell>
                  <TableCell>{token.symbol ?? '-'}</TableCell>
                  <TableCell className="text-right">{formatAmount(token)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={!publicKey || registryMetaQuery.isLoading}
                        onClick={() => {
                          setBurnToken(token)
                          setBurnAmount('')
                          setPuroUserUuid('')
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Redeem
                      </Button>
                      <Button
                        disabled={!publicKey || registryMetaQuery.isLoading}
                        onClick={() => {
                          setRetireToken(token)
                          setRetireAmount('')
                          setRetireForm({ ...DEFAULT_RETIRE_FORM })
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Retire
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(burnToken)}
        onOpenChange={(open) => {
          if (!open && !isBurning) {
            setBurnToken(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem token</DialogTitle>
            <DialogDescription className="text-slate-700">
              After burning, CORC tokens will be sent to the puro account you
              specify.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="m-0">
                <span className="text-muted-foreground">Token:</span>{' '}
                {burnToken?.name ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Symbol:</span>{' '}
                {burnToken?.symbol ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Amount:</span>{' '}
                {burnToken ? formatAmount(burnToken) : '-'}
              </p>
              <p className="m-0 break-all">
                <span className="text-muted-foreground">Mint:</span>{' '}
                {burnToken?.mint ?? '-'}
              </p>
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Amount</p>
              <Input
                inputMode="decimal"
                onChange={(event) => setBurnAmount(event.target.value)}
                placeholder="20"
                value={burnAmount}
              />
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">
                Puro receiving address
              </p>
              <Input
                onChange={(event) => setPuroUserUuid(event.target.value)}
                placeholder="d0e74115-132e-402f-838e-b2579dba6355"
                value={puroUserUuid}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={isBurning}
              onClick={() => setBurnToken(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isBurning} onClick={() => void handleBurnSubmit()}>
              {isBurning ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Redeem'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(retireToken)}
        onOpenChange={(open) => {
          if (!open && !isRetiring) {
            setRetireToken(null)
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-x-hidden overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Retire token</DialogTitle>
            <DialogDescription className="text-slate-700">
              Fill retire details, then confirm retirement on-chain.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p className="m-0">
                <span className="text-muted-foreground">Token:</span>{' '}
                {retireToken?.name ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Symbol:</span>{' '}
                {retireToken?.symbol ?? '-'}
              </p>
              <p className="m-0">
                <span className="text-muted-foreground">Amount:</span>{' '}
                {retireToken ? formatAmount(retireToken) : '-'}
              </p>
              <p className="m-0 break-all">
                <span className="text-muted-foreground">Mint:</span>{' '}
                {retireToken?.mint ?? '-'}
              </p>
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Amount</p>
              <Input
                inputMode="decimal"
                onChange={(event) => setRetireAmount(event.target.value)}
                placeholder="20"
                value={retireAmount}
              />
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Beneficiary name</p>
              <Input
                onChange={(event) =>
                  setRetireForm((prev) => ({
                    ...prev,
                    beneficiaryName: event.target.value,
                  }))
                }
                placeholder="Acme Corp"
                value={retireForm.beneficiaryName}
              />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Beneficiary location</p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      beneficiaryLocation: event.target.value,
                    }))
                  }
                  placeholder="Berlin, Germany"
                  value={retireForm.beneficiaryLocation}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">
                  Beneficiary contact email
                </p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      beneficiaryContactPersonEmail: event.target.value,
                    }))
                  }
                  placeholder="contact@acme.com"
                  value={retireForm.beneficiaryContactPersonEmail}
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Beneficiary type</p>
                <select
                  className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      beneficiaryType: event.target.value as RetireBeneficiaryType,
                    }))
                  }
                  value={retireForm.beneficiaryType}
                >
                  {RETIRE_BENEFICIARY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Usage type</p>
                <select
                  className="h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      usageType: event.target.value as RetireUsageType,
                    }))
                  }
                  value={retireForm.usageType}
                >
                  {RETIRE_USAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Country of consumption</p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      countryOfConsumption: event.target.value,
                    }))
                  }
                  placeholder="DE"
                  value={retireForm.countryOfConsumption}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Retirement purpose</p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      retirementPurpose: event.target.value,
                    }))
                  }
                  placeholder="Internal climate target"
                  value={retireForm.retirementPurpose}
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">
                  Consumption start date
                </p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      consumptionPeriodStartDate: event.target.value,
                    }))
                  }
                  placeholder="2026-01-01"
                  type="date"
                  value={retireForm.consumptionPeriodStartDate}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Consumption end date</p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      consumptionPeriodEndDate: event.target.value,
                    }))
                  }
                  placeholder="2026-12-31"
                  type="date"
                  value={retireForm.consumptionPeriodEndDate}
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">
                  Beneficiary hidden until
                </p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      beneficiaryHiddenUntil: event.target.value,
                    }))
                  }
                  placeholder="2026-12-31"
                  type="date"
                  value={retireForm.beneficiaryHiddenUntil}
                />
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 text-sm text-slate-700">Offtake agreement ID</p>
                <Input
                  onChange={(event) =>
                    setRetireForm((prev) => ({
                      ...prev,
                      offtakeAgreementId: event.target.value,
                    }))
                  }
                  placeholder="optional"
                  value={retireForm.offtakeAgreementId}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={isRetiring}
              onClick={() => setRetireToken(null)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isRetiring} onClick={() => void handleRetireSubmit()}>
              {isRetiring ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Retire'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="fixed right-4 bottom-4 z-[70] grid w-[min(34rem,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              'rounded-lg border p-4 text-base shadow-md',
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-slate-300 bg-white text-slate-800',
            ].join(' ')}
          >
            <p className="m-0">{toast.text}</p>
            {toast.signature ? (
              <p className="mt-1 mb-0 break-all text-xs text-muted-foreground">
                Signature: {toast.signature}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
