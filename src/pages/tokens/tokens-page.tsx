import { useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { qist_puro } from 'qist-puro-sdk'
import { AccountId } from 'qist-puro-sdk/lib/qist-puro/functions/getters/getSpecificAccounts'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { createRetire } from '@/shared/api/retire/requests'
import { fetchSponsoredTransaction } from '@/shared/api/sponsored-transaction/requests'
import { SPONSORED_TX_TYPES } from '@/shared/api/sponsored-transaction/types'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import {
  CONFIG_PUBKEY,
  MINTER_PDA,
  RPC_URL,
  SOLANA_CHAIN,
} from '@/shared/constants/solana'
import { getApiErrorMessage } from '@/shared/lib/api-errors'
import {
  base64ToBytes,
  parseLocalizedNumber,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import {
  getVintageTokens,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { useToast } from '@/shared/ui/toast-provider'
import { useUsdcBalanceQuery } from '@/shared/api/solana/queries/use-usdc-balance-query'
import type { CreateRetirePayload } from '@/shared/api/retire/types'
import { clampIntegerInput } from '@/shared/lib/numeric-input'
import { EditListingDialog } from '@/pages/marketplace/components/edit-listing-dialog'
import { MOCK_LISTINGS } from '@/pages/marketplace/lib/mock-listings'
import { ListTokenDialog } from './components/list-token-dialog'
import { RetireTokenDialog } from './components/retire-token-dialog'
import { HoldingsTable, type HoldingRow } from './components/holdings-table'
import { MOCK_HOLDINGS, MOCK_REGISTRY_META } from './lib/mock-holdings'
import {
  DEFAULT_RETIRE_FORM,
  type RetireFormState,
  type VintageRegistryMeta,
} from './model'

type ListingAccount = {
  publicKey: string
  user: string
  vintageMint: string
  registry: string
  rentPayer: string
  paymentMint: string
  amountToSell: string
  unitPrice: string
  createdAt: string
}

const USDC_DECIMALS = 1_000_000
const MOCK_AUTH = import.meta.env.VITE_DEV_MOCK_AUTH === 'true'

function formatPrice(unitPrice: string) {
  const asNumber = Number(unitPrice)
  if (!Number.isFinite(asNumber)) return unitPrice
  return (asNumber / USDC_DECIMALS).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

async function fetchMarketplaceListings(): Promise<ListingAccount[]> {
  if (MOCK_AUTH) return MOCK_LISTINGS

  const connection = new Connection(RPC_URL, 'confirmed')
  const rawAccounts = await qist_puro.functions.getters.getSpecificAccounts(
    AccountId.Listing,
    connection
  )

  return rawAccounts.map((rawAccount) => ({
    publicKey: String(rawAccount.publicKey),
    user: String(rawAccount.user),
    vintageMint: String(rawAccount.vintageMint),
    registry: String(rawAccount.registry),
    rentPayer: String(rawAccount.rentPayer),
    paymentMint: String(rawAccount.paymentMint),
    amountToSell: String(rawAccount.amountToSell),
    unitPrice: String(rawAccount.unitPrice),
    createdAt: String(rawAccount.createdAt),
  }))
}

export function TokensPage() {
  const { connectWallet } = usePrivy()
  const { connected, connectedWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const connection = useMemo(() => new Connection(RPC_URL, 'confirmed'), [])
  const queryClient = useQueryClient()
  const { showToast, updateToast } = useToast()

  const ownerAddress = walletAddress
  const publicKey = ownerAddress && !MOCK_AUTH ? new PublicKey(ownerAddress) : null

  const vintageTokensQuery = useQuery<VintageToken[], Error>({
    queryKey: ['tokens', 'vintage', ownerAddress],
    queryFn: () => {
      if (MOCK_AUTH) return Promise.resolve(MOCK_HOLDINGS)
      return getVintageTokens({
        ownerAddress: ownerAddress ?? '',
        rpcUrl: RPC_URL,
        minterPda: MINTER_PDA,
      })
    },
    enabled: Boolean(ownerAddress),
  })

  const listingsQuery = useQuery<ListingAccount[], Error>({
    queryKey: QUERY_KEYS.MARKETPLACE_LISTINGS,
    queryFn: fetchMarketplaceListings,
    enabled: Boolean(ownerAddress),
  })

  const registryMetaQuery = useQuery<VintageRegistryMeta[], Error>({
    queryKey: ['tokens', 'vintage-registry'],
    queryFn: async () => {
      if (MOCK_AUTH) return MOCK_REGISTRY_META

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

          const companyId32 = qist_puro.helpers
            .decodeFixedBytes(companyIdBytes)
            .replaceAll(String.fromCharCode(0), '')

          if (!companyId32) return null

          return { tokenMint, companyId32, year } satisfies VintageRegistryMeta
        })
        .filter((item): item is VintageRegistryMeta => item !== null)
    },
    enabled: Boolean(ownerAddress),
  })

  const myListings = useMemo(() => {
    if (!ownerAddress) return []
    return (listingsQuery.data ?? []).filter((listing) => listing.user === ownerAddress)
  }, [listingsQuery.data, ownerAddress])

  const rows = useMemo<HoldingRow[]>(() => {
    const tokens = vintageTokensQuery.data ?? []
    const byMint = new Map<string, HoldingRow>()

    for (const token of tokens) {
      const balance = (token.tokenInfo as { balance?: unknown })?.balance
      const heldAmount =
        typeof balance === 'number' && Number.isFinite(balance) ? balance : 0
      byMint.set(token.mint, {
        vintageMint: token.mint,
        token,
        heldAmount,
        listings: [],
      })
    }

    for (const listing of myListings) {
      const existing = byMint.get(listing.vintageMint)
      if (existing) {
        existing.listings.push(listing)
      } else {
        byMint.set(listing.vintageMint, {
          vintageMint: listing.vintageMint,
          token: null,
          heldAmount: 0,
          listings: [listing],
        })
      }
    }

    return Array.from(byMint.values()).sort(
      (a, b) =>
        b.heldAmount - a.heldAmount ||
        b.listings.reduce((sum, l) => sum + Number(l.amountToSell), 0) -
          a.listings.reduce((sum, l) => sum + Number(l.amountToSell), 0)
    )
  }, [vintageTokensQuery.data, myListings])

  const totalHeldCredits = rows.reduce((sum, row) => sum + row.heldAmount, 0)
  const totalListedCredits = rows.reduce(
    (sum, row) =>
      sum +
      row.listings.reduce((acc, listing) => acc + Number(listing.amountToSell || '0'), 0),
    0
  )

  const usdcBalanceQuery = useUsdcBalanceQuery(walletAddress)

  const [listToken, setListToken] = useState<VintageToken | null>(null)
  const [listAmount, setListAmount] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [isListing, setIsListing] = useState(false)
  const [retireToken, setRetireToken] = useState<VintageToken | null>(null)
  const [retireAmount, setRetireAmount] = useState('')
  const [retireForm, setRetireForm] = useState<RetireFormState>(
    () => ({ ...DEFAULT_RETIRE_FORM })
  )
  const [isRetiring, setIsRetiring] = useState(false)
  const [editListing, setEditListing] = useState<ListingAccount | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  async function sendSponsoredTransaction(input: {
    txType:
      | typeof SPONSORED_TX_TYPES.LIST_VINTAGE
      | typeof SPONSORED_TX_TYPES.RETIRE_VINTAGE
      | typeof SPONSORED_TX_TYPES.EDIT_LISTING
    registry?: string
    amount: number
    price?: number
    carbxRetireUuid?: string
    listing?: string
    listingRentPayer?: string
  }) {
    if (!publicKey) throw new Error('Wallet is not connected')
    if (!connectedWallet) throw new Error('No connected Privy wallet found')

    const sponsoredTx = await fetchSponsoredTransaction({
      txType: input.txType,
      user: publicKey.toBase58(),
      registry: input.registry,
      amount: input.amount,
      price: input.price,
      carbxRetireUuid: input.carbxRetireUuid,
      listing: input.listing,
      listingRentPayer: input.listingRentPayer,
    })

    if (sponsoredTx.errorMessage) throw new Error(sponsoredTx.errorMessage)
    if (!sponsoredTx.tx) throw new Error('Sponsored transaction payload is empty')

    const signatureResult = await signAndSendTransaction({
      transaction: base64ToBytes(sponsoredTx.tx),
      wallet: connectedWallet,
      chain: SOLANA_CHAIN,
      options: { skipPreflight: true },
    })

    const signature = bs58.encode(signatureResult.signature)
    await waitForTransactionConfirmation(connection, signature)

    return signature
  }

  async function handleListSubmit() {
    if (!listToken) return

    if (MOCK_AUTH) {
      showToast({
        type: 'info',
        text: 'Mock mode: real list disabled. Wire backend to enable.',
        durationMs: 4000,
      })
      setListToken(null)
      setListAmount('')
      setListPrice('')
      return
    }

    if (!publicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    let amount: number
    try {
      amount = parseLocalizedNumber(listAmount)
    } catch {
      amount = Number.NaN
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      showToast({ type: 'error', text: 'Amount must be a positive integer', durationMs: 5000 })
      return
    }

    let priceUsdc: number
    try {
      priceUsdc = parseLocalizedNumber(listPrice)
    } catch {
      priceUsdc = Number.NaN
    }
    if (!Number.isFinite(priceUsdc) || priceUsdc <= 0) {
      showToast({ type: 'error', text: 'Price must be a positive number', durationMs: 5000 })
      return
    }

    const price = Math.round(priceUsdc * USDC_DECIMALS)
    if (!Number.isInteger(price) || price <= 0) {
      showToast({ type: 'error', text: 'Converted price must be greater than zero', durationMs: 5000 })
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === listToken.mint
    )
    if (!tokenRegistry) {
      showToast({ type: 'error', text: 'Registry data for selected token was not found', durationMs: 7000 })
      return
    }

    setIsListing(true)
    const toastId = showToast({ type: 'info', text: 'Building list transaction...' })

    try {
      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId32,
        tokenRegistry.year
      )

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
      const signature = await sendSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.LIST_VINTAGE,
        registry: registry.toBase58(),
        amount,
        price,
      })

      updateToast(toastId, {
        type: 'success',
        text: 'List transaction confirmed',
        signature,
        durationMs: 6000,
      })

      setListToken(null)
      setListAmount('')
      setListPrice('')
      await vintageTokensQuery.refetch()
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MARKETPLACE_LISTINGS })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'List failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsListing(false)
    }
  }

  async function handleRetireSubmit() {
    if (!retireToken) return

    if (MOCK_AUTH) {
      showToast({
        type: 'info',
        text: 'Mock mode: real retire disabled. Wire backend to enable.',
        durationMs: 4000,
      })
      setRetireToken(null)
      setRetireAmount('')
      setRetireForm({ ...DEFAULT_RETIRE_FORM })
      return
    }

    if (!publicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    let amount: number
    try {
      amount = parseLocalizedNumber(retireAmount)
    } catch {
      amount = Number.NaN
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast({ type: 'error', text: 'Amount must be a positive number', durationMs: 5000 })
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === retireToken.mint
    )
    if (!tokenRegistry) {
      showToast({ type: 'error', text: 'Registry data for selected token was not found', durationMs: 7000 })
      return
    }

    setIsRetiring(true)
    const toastId = showToast({ type: 'info', text: 'Creating retire request...' })

    try {
      const payload: CreateRetirePayload = {
        beneficiaryName: retireForm.beneficiaryName.trim(),
        beneficiaryLocation: retireForm.beneficiaryLocation.trim(),
        beneficiaryType: retireForm.beneficiaryType,
        beneficiaryContactPersonEmail: retireForm.beneficiaryContactPersonEmail.trim(),
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

      updateToast(toastId, { type: 'info', text: 'Building retire transaction...' })

      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId32,
        tokenRegistry.year
      )

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
      const signature = await sendSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.RETIRE_VINTAGE,
        registry: registry.toBase58(),
        amount,
        carbxRetireUuid: retireResponse.carbxRetireUuid,
      })

      updateToast(toastId, {
        type: 'success',
        text: 'Retire transaction confirmed',
        signature,
        durationMs: 6000,
      })

      setRetireToken(null)
      setRetireAmount('')
      setRetireForm({ ...DEFAULT_RETIRE_FORM })
      await vintageTokensQuery.refetch()
    } catch (error) {
      updateToast(toastId, {
        type: 'error',
        text: getApiErrorMessage(error, 'Retire failed'),
        durationMs: 7000,
      })
    } finally {
      setIsRetiring(false)
    }
  }

  async function handleEditListingSubmit() {
    if (!editListing) return

    if (MOCK_AUTH) {
      showToast({
        type: 'info',
        text: 'Mock mode: real edit disabled. Wire backend to enable.',
        durationMs: 4000,
      })
      setEditListing(null)
      setEditAmount('')
      setEditPrice('')
      return
    }

    let amount: number
    try {
      amount = parseLocalizedNumber(editAmount)
    } catch {
      amount = Number.NaN
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      showToast({ type: 'error', text: 'Amount must be a positive integer', durationMs: 5000 })
      return
    }

    let priceUsdc: number
    try {
      priceUsdc = parseLocalizedNumber(editPrice)
    } catch {
      priceUsdc = Number.NaN
    }
    if (!Number.isFinite(priceUsdc) || priceUsdc <= 0) {
      showToast({ type: 'error', text: 'Price must be a positive number', durationMs: 5000 })
      return
    }

    const price = Math.round(priceUsdc * USDC_DECIMALS)

    setIsEditing(true)
    const toastId = showToast({ type: 'info', text: 'Building edit listing transaction...' })

    try {
      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
      const signature = await sendSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.EDIT_LISTING,
        registry: editListing.registry,
        listing: editListing.publicKey,
        listingRentPayer: editListing.rentPayer,
        amount,
        price,
      })

      updateToast(toastId, {
        type: 'success',
        text: 'Listing updated',
        signature,
        durationMs: 6000,
      })

      setEditListing(null)
      setEditAmount('')
      setEditPrice('')
      await listingsQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit listing failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsEditing(false)
    }
  }

  function openEditListing(listingPublicKey: string) {
    const listing = myListings.find((l) => l.publicKey === listingPublicKey)
    if (!listing) return
    setEditListing(listing)
    setEditAmount(listing.amountToSell)
    setEditPrice(formatPrice(listing.unitPrice))
  }

  const editListingToken = useMemo(() => {
    if (!editListing) return null
    return (vintageTokensQuery.data ?? []).find((t) => t.mint === editListing.vintageMint) ?? null
  }, [editListing, vintageTokensQuery.data])

  const editListingMaxAmount = useMemo(() => {
    if (!editListing) return 0

    const walletBalance = Number(
      (editListingToken?.tokenInfo as { balance?: unknown } | null | undefined)?.balance ?? 0
    )
    const listingBalance = Number(editListing.amountToSell)

    return Math.max(0, walletBalance + listingBalance)
  }, [editListing, editListingToken])

  const isFetching =
    vintageTokensQuery.isFetching ||
    registryMetaQuery.isFetching ||
    listingsQuery.isFetching
  const isBusy = isListing || isRetiring || isEditing
  const usdcBalance = usdcBalanceQuery.data ?? 0
  const usdcBalanceText = walletAddress
    ? usdcBalanceQuery.isLoading
      ? '—'
      : `$${usdcBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : '—'

  return (
    <section className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total cash" value={usdcBalanceText} />
        <StatCard label="Total held" value={`${totalHeldCredits.toLocaleString()} credits`} />
        <StatCard label="Total listed" value={`${totalListedCredits.toLocaleString()} credits`} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="num text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? 'project' : 'projects'}
        </p>
        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            void vintageTokensQuery.refetch()
            void registryMetaQuery.refetch()
            void listingsQuery.refetch()
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <RotateCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Updating' : 'Update'}
        </button>
      </div>

      <HoldingsTable
        rows={rows}
        isLoading={vintageTokensQuery.isLoading}
        isError={vintageTokensQuery.isError}
        errorMessage={vintageTokensQuery.error?.message}
        connected={connected}
        ownerAddress={ownerAddress || null}
        onConnectWallet={() => connectWallet({ walletChainType: 'solana-only' })}
        onRetire={(token) => {
          setRetireToken(token)
          setRetireAmount('')
          setRetireForm({ ...DEFAULT_RETIRE_FORM })
        }}
        onList={(token) => {
          setListToken(token)
          setListAmount('')
          setListPrice('')
        }}
        onManageListing={openEditListing}
        disabled={isBusy}
      />

      <ListTokenDialog
        amount={listAmount}
        isSubmitting={isListing}
        onAmountChange={setListAmount}
        onClose={() => setListToken(null)}
        onPriceChange={setListPrice}
        onSubmit={() => void handleListSubmit()}
        price={listPrice}
        token={listToken}
      />

      <RetireTokenDialog
        amount={retireAmount}
        form={retireForm}
        isSubmitting={isRetiring}
        onAmountChange={setRetireAmount}
        onClose={() => setRetireToken(null)}
        onFormChange={(patch) =>
          setRetireForm((prev) => ({ ...prev, ...patch }))
        }
        onSubmit={() => void handleRetireSubmit()}
        token={retireToken}
      />

      <EditListingDialog
        amount={editAmount}
        isSubmitting={isEditing}
        listing={
          editListing
            ? {
                user: editListing.user,
                amountToSell: editListing.amountToSell,
                maxAmountToSell: editListingMaxAmount,
                unitPrice: formatPrice(editListing.unitPrice),
              }
            : null
        }
        onAmountChange={(value) => setEditAmount(clampIntegerInput(value, editListingMaxAmount))}
        onClose={() => setEditListing(null)}
        onPriceChange={setEditPrice}
        onSubmit={() => void handleEditListingSubmit()}
        price={editPrice}
        token={editListingToken}
      />
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="num mt-1.5 text-xl font-bold text-foreground">{value}</div>
    </div>
  )
}
