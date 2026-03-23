import { ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  formatSolanaAddressShort,
  formatVintageTokenAmount,
  getSolscanTokenUrl,
  type VintageToken,
} from '@/shared/lib/vintage-tokens'
import { SOLSCAN_CLUSTER } from '@/shared/constants/solana'

type TokensTableProps = {
  connected: boolean
  ownerAddress: string
  canAct: boolean
  isRefreshing: boolean
  isRegistryLoading: boolean
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  tokens: VintageToken[]
  onConnectWallet: () => void
  onRefresh: () => void
  onRedeem: (token: VintageToken) => void
  onRetire: (token: VintageToken) => void
}

export function TokensTable({
  connected,
  ownerAddress,
  canAct,
  isRefreshing,
  isRegistryLoading,
  isLoading,
  isError,
  errorMessage,
  tokens,
  onConnectWallet,
  onRefresh,
  onRedeem,
  onRetire,
}: TokensTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tokenized CORC in your wallet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {!connected ? (
          <div className="grid gap-2">
            <Button onClick={onConnectWallet}>Connect wallet</Button>
            <p className="m-0 text-sm text-muted-foreground">
              Connect a Solana wallet through Privy to load tokens.
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
            disabled={!ownerAddress || isRefreshing}
            onClick={onRefresh}
            variant="outline"
          >
            {isRefreshing ? (
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
            {ownerAddress && isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Loading tokens...
                </TableCell>
              </TableRow>
            ) : null}

            {ownerAddress && isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-destructive">
                  Failed to load tokens: {errorMessage}
                </TableCell>
              </TableRow>
            ) : null}

            {ownerAddress && !isLoading && !isError && tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No tokens found for this wallet and minter.
                </TableCell>
              </TableRow>
            ) : null}

            {tokens.map((token) => (
              <TableRow key={token.mint}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatSolanaAddressShort(token.mint)}
                    </span>
                    <Button asChild size="xs" variant="ghost">
                      <a
                        href={getSolscanTokenUrl(token.mint, SOLSCAN_CLUSTER)}
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
                <TableCell className="text-right">
                  {formatVintageTokenAmount(token)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      disabled={!canAct || isRegistryLoading}
                      onClick={() => onRedeem(token)}
                      size="sm"
                      variant="outline"
                    >
                      Redeem
                    </Button>
                    <Button
                      disabled={!canAct || isRegistryLoading}
                      onClick={() => onRetire(token)}
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
  )
}
