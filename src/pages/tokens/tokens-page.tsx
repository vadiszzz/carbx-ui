import { useState } from 'react'
import { Coins } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import { qist_puro } from 'qist-puro-sdk'
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
  isValidSolanaAddress,
  parseLocalizedNumber,
  parseUiAmountToAtomic,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import {
  formatVintageTokenAmount,
  getVintageTokens,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { useToast } from '@/shared/ui/toast-provider'
import { PageHeader } from '@/shared/ui/page-header'
import { WithdrawTokenDialog } from '@/shared/ui/withdraw-token-dialog'
import type { CreateRetirePayload } from '@/shared/api/retire/types'
import { BurnTokenDialog } from './components/burn-token-dialog'
import { ListTokenDialog } from './components/list-token-dialog'
import { RetireTokenDialog } from './components/retire-token-dialog'
import { TokensTable } from './components/tokens-table'
import {
  DEFAULT_RETIRE_FORM,
  type RetireFormState,
  type VintageRegistryMeta,
} from './model'

const USDC_DECIMALS = 1_000_000

export function TokensPage() {
  const { connectWallet } = usePrivy()
  const { connected, connectedWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const connection = new Connection(RPC_URL, 'confirmed')
  const queryClient = useQueryClient()

  const ownerAddress = walletAddress
  const publicKey = ownerAddress ? new PublicKey(ownerAddress) : null
  const { showToast, updateToast } = useToast()

  const vintageTokensQuery = useQuery<VintageToken[], Error>({
    queryKey: ['tokens', 'vintage', ownerAddress],
    queryFn: () =>
      getVintageTokens({
        ownerAddress,
        rpcUrl: RPC_URL,
        minterPda: MINTER_PDA,
      }),
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

          const companyId32 = qist_puro.helpers
            .decodeFixedBytes(companyIdBytes)
            .replaceAll(String.fromCharCode(0), '')

          if (!companyId32) return null

          return {
            tokenMint,
            companyId32,
            year,
          } satisfies VintageRegistryMeta
        })
        .filter((item): item is VintageRegistryMeta => item !== null)
    },
    enabled: Boolean(ownerAddress),
  })

  const [burnToken, setBurnToken] = useState<VintageToken | null>(null)
  const [burnAmount, setBurnAmount] = useState('')
  const [puroUserUuid, setPuroUserUuid] = useState('')
  const [isBurning, setIsBurning] = useState(false)
  const [listToken, setListToken] = useState<VintageToken | null>(null)
  const [listAmount, setListAmount] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [isListing, setIsListing] = useState(false)
  const [withdrawToken, setWithdrawToken] = useState<VintageToken | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [retireToken, setRetireToken] = useState<VintageToken | null>(null)
  const [retireAmount, setRetireAmount] = useState('')
  const [retireForm, setRetireForm] = useState<RetireFormState>(
    () => ({ ...DEFAULT_RETIRE_FORM })
  )
  const [isRetiring, setIsRetiring] = useState(false)

  async function sendSponsoredTransaction(input: {
    txType:
      | typeof SPONSORED_TX_TYPES.LIST_VINTAGE
      | typeof SPONSORED_TX_TYPES.BURN_VINTAGE
      | typeof SPONSORED_TX_TYPES.RETIRE_VINTAGE
      | typeof SPONSORED_TX_TYPES.TRANSFER_TOKEN
    registry?: string
    amount: number
    price?: number
    carbxRetireUuid?: string
    puroUserUuid?: string
    tokenMint?: string
    recipient?: string
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
      registry: input.registry,
      amount: input.amount,
      price: input.price,
      carbxRetireUuid: input.carbxRetireUuid,
      puroUserUuid: input.puroUserUuid,
      tokenMint: input.tokenMint,
      recipient: input.recipient,
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

  async function handleWithdrawSubmit() {
    if (!withdrawToken) return
    if (!publicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    const recipient = withdrawRecipient.trim()
    if (!isValidSolanaAddress(recipient)) {
      showToast({
        type: 'error',
        text: 'Recipient must be a valid Solana address',
        durationMs: 5000,
      })
      return
    }

    const decimals =
      typeof withdrawToken.tokenInfo?.decimals === 'number'
        ? withdrawToken.tokenInfo.decimals
        : 0

    let amount: number
    try {
      amount = parseUiAmountToAtomic(withdrawAmount, decimals)
    } catch (error) {
      showToast({
        type: 'error',
        text: error instanceof Error ? error.message : 'Amount is invalid',
        durationMs: 5000,
      })
      return
    }

    if (amount <= 0) {
      showToast({
        type: 'error',
        text: 'Amount must be greater than zero',
        durationMs: 5000,
      })
      return
    }

    const availableBalance = withdrawToken.tokenInfo?.balance
    if (
      typeof availableBalance === 'number' &&
      Number.isFinite(availableBalance) &&
      amount > availableBalance
    ) {
      showToast({
        type: 'error',
        text: 'Amount exceeds available token balance',
        durationMs: 5000,
      })
      return
    }

    setIsWithdrawing(true)
    const toastId = showToast({
      type: 'info',
      text: 'Building withdraw transaction...',
    })

    try {
      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
      const signature = await sendSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.TRANSFER_TOKEN,
        amount,
        tokenMint: withdrawToken.mint,
        recipient,
      })

      updateToast(toastId, {
        type: 'success',
        text: 'Withdraw transaction confirmed',
        signature,
        durationMs: 6000,
      })

      setWithdrawToken(null)
      setWithdrawAmount('')
      setWithdrawRecipient('')
      await vintageTokensQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Withdraw failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsWithdrawing(false)
    }
  }

  async function handleListSubmit() {
    if (!listToken) return
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
      showToast({
        type: 'error',
        text: 'Amount must be a positive integer',
        durationMs: 5000,
      })
      return
    }

    let priceUsdc: number
    try {
      priceUsdc = parseLocalizedNumber(listPrice)
    } catch {
      priceUsdc = Number.NaN
    }
    if (!Number.isFinite(priceUsdc) || priceUsdc <= 0) {
      showToast({
        type: 'error',
        text: 'Price must be a positive number in USDC',
        durationMs: 5000,
      })
      return
    }

    const price = Math.round(priceUsdc * USDC_DECIMALS)
    if (!Number.isInteger(price) || price <= 0) {
      showToast({
        type: 'error',
        text: 'Converted price must be greater than zero',
        durationMs: 5000,
      })
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === listToken.mint
    )
    if (!tokenRegistry) {
      showToast({
        type: 'error',
        text: 'Registry data for selected token was not found',
        durationMs: 7000,
      })
      return
    }

    setIsListing(true)
    const toastId = showToast({
      type: 'info',
      text: 'Building list transaction...',
    })

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

  async function handleBurnSubmit() {
    if (!burnToken) return
    if (!publicKey) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    let amount: number
    try {
      amount = parseLocalizedNumber(burnAmount)
    } catch {
      amount = Number.NaN
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast({ type: 'error', text: 'Amount must be a positive number', durationMs: 5000 })
      return
    }

    if (!puroUserUuid.trim()) {
      showToast({ type: 'error', text: 'Puro user address is required', durationMs: 5000 })
      return
    }

    const tokenRegistry = (registryMetaQuery.data ?? []).find(
      (registry) => registry.tokenMint === burnToken.mint
    )
    if (!tokenRegistry) {
      showToast({
        type: 'error',
        text: 'Registry data for selected token was not found',
        durationMs: 7000,
      })
      return
    }

    setIsBurning(true)
    const toastId = showToast({
      type: 'info',
      text: 'Building burn transaction...',
    })

    try {
      const registry = qist_puro.helpers.findRegistryPda(
        CONFIG_PUBKEY,
        tokenRegistry.companyId32,
        tokenRegistry.year
      )

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
      const signature = await sendSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.BURN_VINTAGE,
        registry: registry.toBase58(),
        amount,
        puroUserUuid: puroUserUuid.trim(),
      })

      updateToast(
        toastId,
        {
          type: 'success',
          text: 'Transaction confirmed',
          signature,
          durationMs: 6000,
        },
      )

      setBurnToken(null)
      setBurnAmount('')
      setPuroUserUuid('')
      await vintageTokensQuery.refetch()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Burn failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsBurning(false)
    }
  }

  async function handleRetireSubmit() {
    if (!retireToken) return
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
      showToast({
        type: 'error',
        text: 'Registry data for selected token was not found',
        durationMs: 7000,
      })
      return
    }

    setIsRetiring(true)
    const toastId = showToast({
      type: 'info',
      text: 'Creating retire request...',
    })

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

      updateToast(
        toastId,
        {
          type: 'success',
          text: 'Retire transaction confirmed',
          signature,
          durationMs: 6000,
        },
      )

      setRetireToken(null)
      setRetireAmount('')
      setRetireForm({ ...DEFAULT_RETIRE_FORM })
      await vintageTokensQuery.refetch()
    } catch (error) {
      updateToast(
        toastId,
        {
          type: 'error',
          text: getApiErrorMessage(error, 'Retire failed'),
          durationMs: 7000,
        }
      )
    } finally {
      setIsRetiring(false)
    }
  }

  return (
    <section className="grid gap-5">
      <PageHeader
        description="Review tokenized assets in the connected wallet, then redeem or retire them through the CarbX transaction flow."
        kicker={
          <div className="page-kicker">
            <Coins className="size-3.5" />
            Wallet inventory
          </div>
        }
        title="Tokens"
      />

      <TokensTable
        canAct={Boolean(publicKey)}
        connected={connected}
        errorMessage={vintageTokensQuery.error?.message}
        isError={vintageTokensQuery.isError}
        isLoading={vintageTokensQuery.isLoading}
        isRefreshing={vintageTokensQuery.isFetching}
        isRegistryLoading={registryMetaQuery.isLoading}
        onConnectWallet={() => connectWallet({ walletChainType: 'solana-only' })}
        onWithdraw={(token) => {
          setWithdrawToken(token)
          setWithdrawAmount('')
          setWithdrawRecipient('')
        }}
        onList={(token) => {
          setListToken(token)
          setListAmount('')
          setListPrice('')
        }}
        onRedeem={(token) => {
          setBurnToken(token)
          setBurnAmount('')
          setPuroUserUuid('')
        }}
        onRefresh={() => void vintageTokensQuery.refetch()}
        onRetire={(token) => {
          setRetireToken(token)
          setRetireAmount('')
          setRetireForm({ ...DEFAULT_RETIRE_FORM })
        }}
        ownerAddress={ownerAddress}
        tokens={vintageTokensQuery.data ?? []}
      />

      <WithdrawTokenDialog
        amount={withdrawAmount}
        availableAmount={withdrawToken ? formatVintageTokenAmount(withdrawToken) : '-'}
        isSubmitting={isWithdrawing}
        onAmountChange={setWithdrawAmount}
        onClose={() => setWithdrawToken(null)}
        onRecipientChange={setWithdrawRecipient}
        onSubmit={() => void handleWithdrawSubmit()}
        open={Boolean(withdrawToken)}
        recipient={withdrawRecipient}
        tokenMint={withdrawToken?.mint ?? ''}
        tokenName={withdrawToken?.name ?? 'Token'}
        tokenSymbol={withdrawToken?.symbol}
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

      <BurnTokenDialog
        amount={burnAmount}
        isSubmitting={isBurning}
        onAmountChange={setBurnAmount}
        onClose={() => setBurnToken(null)}
        onPuroUserUuidChange={setPuroUserUuid}
        onSubmit={() => void handleBurnSubmit()}
        puroUserUuid={puroUserUuid}
        token={burnToken}
      />

      <RetireTokenDialog
        amount={retireAmount}
        form={retireForm}
        isSubmitting={isRetiring}
        onAmountChange={setRetireAmount}
        onClose={() => setRetireToken(null)}
        onFormChange={(patch) =>
          setRetireForm((prev) => ({
            ...prev,
            ...patch,
          }))
        }
        onSubmit={() => void handleRetireSubmit()}
        token={retireToken}
      />
    </section>
  )
}
