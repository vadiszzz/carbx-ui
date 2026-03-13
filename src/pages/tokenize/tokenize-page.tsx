import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWalletAuth } from "@/shared/api/auth/hooks/use-wallet-auth";
import { usePuroAccountQuery } from "@/shared/api/puro/queries/use-puro-account-query";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export function TokenizePage() {
  const [copied, setCopied] = useState(false);
  const {
    connected,
    signMessage,
    hasBackendSession,
    isAuthorized,
    isAuthLoading,
    authError,
    signInWithWallet,
  } = useWalletAuth();
  const puroAccountQuery = usePuroAccountQuery();

  const puroAccountNumber = puroAccountQuery.data?.puroAccountNumber ?? "";
  const hasPuroAccount = Boolean(puroAccountNumber);

  async function handleGetPuroAccount() {
    await puroAccountQuery.refetch();
  }

  async function handleCopy() {
    if (!puroAccountNumber) return;
    await navigator.clipboard.writeText(puroAccountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
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
            Connect wallet, sign the message, then click Get puro account to
            receive a Puro destination account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {!connected ? (
              <div className="wallet-connect">
                <WalletMultiButton />
              </div>
            ) : null}

            {connected && !hasBackendSession ? (
              <Button
                disabled={!signMessage || isAuthLoading}
                onClick={() => void signInWithWallet()}
                variant="default"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing...
                  </>
                ) : isAuthorized ? (
                  "Signed in"
                ) : (
                  "Authorize with signature"
                )}
              </Button>
            ) : null}

            {!hasPuroAccount ? (
              <Button
                disabled={
                  !connected || !hasBackendSession || puroAccountQuery.isFetching
                }
                onClick={() => void handleGetPuroAccount()}
              >
                Get puro account
              </Button>
            ) : null}
          </div>

          {!connected ? (
            <p className="m-0 text-sm text-muted-foreground">
              Connect wallet to continue.
            </p>
          ) : null}
          {connected && !signMessage ? (
            <p className="m-0 text-sm text-destructive">
              The selected wallet does not support message signing.
            </p>
          ) : null}
          {connected && !hasBackendSession && signMessage ? (
            <p className="m-0 text-sm text-muted-foreground">
              Authorize with signature to unlock Get puro account.
            </p>
          ) : null}
          {authError ? (
            <p className="m-0 text-sm text-destructive">
              Signature verification failed. Please try again.
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
                  {copied ? "Copied" : "Copy"}
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
  );
}
