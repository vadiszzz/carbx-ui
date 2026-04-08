import { useState } from 'react'
import { CreditCard, LogIn, LogOut, Wallet } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useSignAndSendTransaction } from '@privy-io/react-auth/solana'
import { useQueryClient } from '@tanstack/react-query'
import { Connection } from '@solana/web3.js'
import bs58 from 'bs58'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { fetchSponsoredTransaction } from '@/shared/api/sponsored-transaction/requests'
import { SPONSORED_TX_TYPES } from '@/shared/api/sponsored-transaction/types'
import { QUERY_KEYS } from '@/shared/constants/query-keys'
import { RPC_URL, SOLANA_CHAIN, USDC_MINT } from '@/shared/constants/solana'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
import { getLinkedSolanaWallet } from '@/shared/auth/lib/privy-user'
import { PrivyAccountSummary } from '@/shared/auth/ui/privy-account-summary'
import {
  base64ToBytes,
  isValidSolanaAddress,
  parseUiAmountToAtomic,
  waitForTransactionConfirmation,
} from '@/shared/lib/solana'
import { Button } from '@/shared/ui/button'
import { useToast } from '@/shared/ui/toast-provider'
import { useUsdcBalanceQuery } from '@/shared/api/solana/queries/use-usdc-balance-query'
import { WithdrawTokenDialog } from '@/shared/ui/withdraw-token-dialog'
import { OnramperOnrampDialog } from '@/shared/onramper/ui/onramper-onramp-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export function PrivyAuthDialog() {
  const [open, setOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [onrampOpen, setOnrampOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawRecipient, setWithdrawRecipient] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const navigate = useNavigate()
  const { authenticated, user, login, linkWallet, logout } = usePrivy()
  const { connectedWallet, walletAddress } = usePrivyAuth()
  const { signAndSendTransaction } = useSignAndSendTransaction()
  const { showToast, updateToast } = useToast()
  const queryClient = useQueryClient()
  const connection = new Connection(RPC_URL, 'confirmed')

  const linkedWallet = getLinkedSolanaWallet(user)
  const usdcBalanceQuery = useUsdcBalanceQuery(walletAddress)

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  function openWalletLogin() {
    setOpen(false)
    login({ loginMethods: ['wallet'], walletChainType: 'solana-only' })
  }

  function openEmailLogin() {
    setOpen(false)
    login({ loginMethods: ['email'] })
  }

  function openGoogleLogin() {
    setOpen(false)
    login({ loginMethods: ['google'] })
  }

  function openLinkWallet() {
    setOpen(false)
    linkWallet({ walletChainType: 'solana-only' })
  }

  function closeWithdrawDialog(force = false) {
    if (isWithdrawing && !force) return
    setWithdrawOpen(false)
    setWithdrawAmount('')
    setWithdrawRecipient('')
  }

  async function handleWithdrawUsdc() {
    if (!walletAddress) {
      showToast({ type: 'error', text: 'Wallet is not connected', durationMs: 5000 })
      return
    }

    if (!connectedWallet) {
      showToast({
        type: 'error',
        text: 'Connect your Solana wallet in Privy before withdrawing',
        durationMs: 6000,
      })
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

    let amount: number
    try {
      amount = parseUiAmountToAtomic(withdrawAmount, 6)
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

    const availableUsdc = usdcBalanceQuery.data ?? 0
    if (amount > Math.round(availableUsdc * 1_000_000)) {
      showToast({
        type: 'error',
        text: 'Amount exceeds available USDC balance',
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
      const sponsoredTx = await fetchSponsoredTransaction({
        txType: SPONSORED_TX_TYPES.TRANSFER_TOKEN,
        user: walletAddress,
        amount,
        tokenMint: USDC_MINT,
        recipient,
      })

      if (sponsoredTx.errorMessage) {
        throw new Error(sponsoredTx.errorMessage)
      }

      if (!sponsoredTx.tx) {
        throw new Error('Sponsored transaction payload is empty')
      }

      updateToast(toastId, { type: 'info', text: 'Sending transaction...' })
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

      updateToast(toastId, {
        type: 'success',
        text: 'USDC withdraw confirmed',
        signature,
        durationMs: 6000,
      })

      closeWithdrawDialog(true)
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USDC_BALANCE(walletAddress),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'USDC withdraw failed'
      updateToast(toastId, { type: 'error', text: message, durationMs: 7000 })
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={authenticated ? 'outline' : 'default'}>
        {authenticated ? <Wallet className="size-4" /> : <LogIn className="size-4" />}
        {authenticated ? 'Account' : 'Login'}
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Account Info</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <PrivyAccountSummary />

            {!authenticated ? (
              <div className="grid gap-2">
                <Button onClick={openWalletLogin}>
                  <Wallet className="size-4" />
                  Continue with Wallet
                </Button>
                <Button onClick={openEmailLogin} variant="outline">
                  Continue with Email
                </Button>
                <Button onClick={openGoogleLogin} variant="outline">
                  Continue with Google
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Button
                  disabled={!walletAddress}
                  onClick={() => setOnrampOpen(true)}
                  variant="outline"
                >
                  <CreditCard className="size-4" />
                  Top up with Onramper
                </Button>
                <Button
                  disabled={!walletAddress}
                  onClick={() => setWithdrawOpen(true)}
                  variant="outline"
                >
                  Withdraw USDC
                </Button>
                {!linkedWallet ? (
                  <Button onClick={openLinkWallet} variant="outline">
                    <Wallet className="size-4" />
                    Link Solana Wallet
                  </Button>
                ) : null}
                <Button onClick={() => void handleLogout()} variant="ghost">
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            )}
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <WithdrawTokenDialog
        amount={withdrawAmount}
        availableAmount={
          walletAddress
            ? usdcBalanceQuery.isLoading || usdcBalanceQuery.isFetching
              ? 'Loading...'
              : `${formatUsdcBalance(usdcBalanceQuery.data ?? 0)} USDC`
            : 'No wallet'
        }
        description="Transfer USDC from the connected wallet through a sponsored transaction."
        isSubmitting={isWithdrawing}
        onAmountChange={setWithdrawAmount}
        onClose={closeWithdrawDialog}
        onRecipientChange={setWithdrawRecipient}
        onSubmit={() => void handleWithdrawUsdc()}
        open={withdrawOpen}
        recipient={withdrawRecipient}
        title="Withdraw USDC"
        tokenMint={USDC_MINT}
        tokenName="USD Coin"
        tokenSymbol="USDC"
      />

      <OnramperOnrampDialog
        onClose={() => setOnrampOpen(false)}
        open={onrampOpen}
        walletAddress={walletAddress}
      />
    </>
  )
}

function formatUsdcBalance(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}
