import { useMemo, useState } from 'react'
import { ExternalLink, Loader2 } from 'lucide-react'
import { useWalletAuth } from '@/shared/api/auth/hooks/use-wallet-auth'
import { useGroupedOrdersQuery } from '@/shared/api/orders/queries/use-grouped-orders-query'
import type { Order } from '@/shared/api/orders/types'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

type FlatOrderRow = {
  order: Order
}

const SOLSCAN_CLUSTER = import.meta.env.VITE_RPC_URL?.includes('devnet')
  ? 'devnet'
  : import.meta.env.VITE_RPC_URL?.includes('testnet')
    ? 'testnet'
    : null

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'completed' || normalized === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  if (normalized === 'failed' || normalized === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }
  return 'border-slate-300 bg-slate-100 text-slate-700'
}

function formatCompactValue(value?: string | null) {
  if (!value) return '-'
  if (value.length <= 14) return value
  return `${value.slice(0, 6)}...${value.slice(-6)}`
}

function getSolscanTxUrl(signature: string) {
  if (SOLSCAN_CLUSTER) {
    return `https://solscan.io/tx/${signature}?cluster=${SOLSCAN_CLUSTER}`
  }
  return `https://solscan.io/tx/${signature}`
}

export function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const {
    connected,
    signMessage,
    hasBackendSession,
    isAuthLoading,
    authError,
    signInWithWallet,
  } = useWalletAuth()
  const groupedOrdersQuery = useGroupedOrdersQuery({ enabled: hasBackendSession })

  const orderRows = useMemo<FlatOrderRow[]>(() => {
    const groupedOrders = groupedOrdersQuery.data ?? []
    const rows = groupedOrders.flatMap((group) =>
      group.items.map((order) => ({
        order,
      }))
    )

    return rows.sort((a, b) => {
      const first = new Date(a.order.createdAt ?? 0).getTime()
      const second = new Date(b.order.createdAt ?? 0).getTime()
      return second - first
    })
  }, [groupedOrdersQuery.data])

  const selectedOrder =
    orderRows.find((row) => row.order.orderId === selectedOrderId) ?? null

  return (
    <section className="grid gap-5">
      <div className="grid gap-2">
        <p className="m-0 text-2xl font-semibold tracking-tight">Orders</p>
      </div>

      {selectedOrder ? (
        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>
              Detailed information for selected order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <Button onClick={() => setSelectedOrderId(null)} variant="outline">
                Back to table
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                <p className="m-0">
                  <span className="text-muted-foreground">orderId:</span>{' '}
                  {selectedOrder.order.orderId}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">orderType:</span>{' '}
                  {selectedOrder.order.orderType}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">status:</span>{' '}
                  {selectedOrder.order.status}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">wallet:</span>{' '}
                  {selectedOrder.order.wallet}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">createdAt:</span>{' '}
                  {selectedOrder.order.createdAt ? formatDate(selectedOrder.order.createdAt) : "—"}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">puroAccountNumber:</span>{' '}
                  {selectedOrder.order.puroAccountNumber ?? '-'}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">receivedAmount:</span>{' '}
                  {selectedOrder.order.receivedAmount ?? '-'}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">puroIncomingTxId:</span>{' '}
                  {selectedOrder.order.puroIncomingTxId ?? '-'}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">certificateId:</span>{' '}
                  {selectedOrder.order.certificateId ?? '-'}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">mintSignature:</span>{' '}
                  {selectedOrder.order.mintSignature ? (
                    <span className="inline-flex items-center gap-1">
                      {formatCompactValue(selectedOrder.order.mintSignature)}
                      <Button asChild size="xs" variant="ghost">
                        <a
                          href={getSolscanTxUrl(selectedOrder.order.mintSignature)}
                          rel="noreferrer"
                          target="_blank"
                          title="Open in Solscan"
                        >
                          <ExternalLink className="size-3.5" />
                          <span className="sr-only">Open in Solscan</span>
                        </a>
                      </Button>
                    </span>
                  ) : (
                    '-'
                  )}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">vintage:</span>{' '}
                  {selectedOrder.order.vintage ?? '-'}
                </p>
                <p className="m-0">
                  <span className="text-muted-foreground">methodologyName:</span>{' '}
                  {selectedOrder.order.methodologyName ?? '-'}
                </p>
                {selectedOrder.order.errorMessage ? (
                  <p className="m-0">
                    <span className="text-muted-foreground">errorMessage:</span>{' '}
                    {selectedOrder.order.errorMessage}
                  </p>
                ) : null}
              </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>List of your orders</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!hasBackendSession ? (
              <div className="grid gap-2 rounded-lg border border-dashed p-4">
                <p className="m-0 text-sm text-muted-foreground">
                  Sign with wallet to load your orders.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!connected || !signMessage || isAuthLoading}
                    onClick={() => void signInWithWallet()}
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      'Sign in with wallet'
                    )}
                  </Button>
                </div>
                {!connected ? (
                  <p className="m-0 text-sm text-muted-foreground">
                    Connect wallet in the header first.
                  </p>
                ) : null}
                {connected && !signMessage ? (
                  <p className="m-0 text-sm text-destructive">
                    The selected wallet does not support message signing.
                  </p>
                ) : null}
                {authError ? (
                  <p className="m-0 text-sm text-destructive">
                    Signature verification failed. Please try again.
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  disabled={groupedOrdersQuery.isFetching}
                  onClick={() => void groupedOrdersQuery.refetch()}
                  variant="outline"
                >
                  {groupedOrdersQuery.isFetching ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hasBackendSession && groupedOrdersQuery.isLoading ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={4}>
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : null}

                {hasBackendSession && groupedOrdersQuery.isError ? (
                  <TableRow>
                    <TableCell className="text-destructive" colSpan={4}>
                      Failed to load orders. Try refresh.
                    </TableCell>
                  </TableRow>
                ) : null}

                {hasBackendSession &&
                !groupedOrdersQuery.isLoading &&
                !groupedOrdersQuery.isError &&
                orderRows.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={4}>
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {orderRows.map((row) => (
                  <TableRow
                    key={row.order.orderId}
                    className="cursor-pointer"
                    onClick={() => setSelectedOrderId(row.order.orderId)}
                  >
                    <TableCell className="max-w-56 truncate font-medium">
                      {row.order.orderId}
                    </TableCell>
                    <TableCell>{row.order.orderType}</TableCell>
                    <TableCell>
                     {row.order.createdAt ? formatDate(row.order.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={[
                          'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                          getStatusClass(row.order.status),
                        ].join(' ')}
                      >
                        {row.order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
