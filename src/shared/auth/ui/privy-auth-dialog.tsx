import { useState } from 'react'
import { LogIn, LogOut, Wallet } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/app/router/route-paths'
import { getLinkedSolanaWallet } from '@/shared/auth/lib/privy-user'
import { PrivyAccountSummary } from '@/shared/auth/ui/privy-account-summary'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export function PrivyAuthDialog() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { authenticated, user, login, linkWallet, logout } = usePrivy()

  const linkedWallet = getLinkedSolanaWallet(user)

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
    </>
  )
}
