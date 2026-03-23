import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ExternalLink,
  ReceiptText,
  RotateCw,
  Wallet,
} from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { usePrivyAuth } from '@/shared/auth/hooks/use-privy-auth'
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
import { PageHeader } from '@/shared/ui/page-header'
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

function DetailField(props: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={props.className}>
      <p className="m-0 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
        {props.label}
      </p>
      <div className="mt-1 text-sm text-slate-900">{props.value}</div>
    </div>
  )
}

export function OrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const { authenticated, login, linkWallet } = usePrivy()
  const { hasSolanaWallet } = usePrivyAuth()
  const groupedOrdersQuery = useGroupedOrdersQuery({ enabled: authenticated })

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
      <PageHeader
        description="Track tokenization orders, inspect lifecycle status, and open confirmed mint transactions in Solscan."
        kicker={
          <div className="page-kicker">
            <ReceiptText className="size-3.5" />
            Activity tracking
          </div>
        }
        title="Orders"
      />

      {selectedOrder ? (
        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
            <CardDescription>
              Detailed information for the selected order.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm">
            <div className="app-toolbar justify-between">
              <div className="grid gap-3">
                <Button
                  className="w-fit"
                  onClick={() => setSelectedOrderId(null)}
                  size="sm"
                  variant="outline"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <div className="grid gap-1">
                  <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Selected order
                  </p>
                  <p className="m-0 text-lg font-semibold tracking-tight text-slate-950">
                    {selectedOrder.order.orderId}
                  </p>
                </div>
              </div>
              <span
                className={[
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                  getStatusClass(selectedOrder.order.status),
                ].join(' ')}
              >
                {selectedOrder.order.status}
              </span>
            </div>

            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField
                  label="Order type"
                  value={selectedOrder.order.orderType}
                />
                <DetailField
                  label="Created at"
                  value={
                    selectedOrder.order.createdAt
                      ? formatDate(selectedOrder.order.createdAt)
                      : '-'
                  }
                />
                <DetailField
                  label="Wallet"
                  value={
                    <span className="break-all">
                      {selectedOrder.order.wallet}
                    </span>
                  }
                />
                <DetailField
                  label="Received amount"
                  value={selectedOrder.order.receivedAmount ?? '-'}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200/80 bg-white/80 p-4">
                <p className="m-0 text-sm font-semibold text-slate-950">
                  Source data
                </p>
                <div className="mt-4 grid gap-4">
                  <DetailField
                    label="Puro account number"
                    value={selectedOrder.order.puroAccountNumber ?? '-'}
                  />
                  <DetailField
                    label="Puro incoming tx id"
                    value={selectedOrder.order.puroIncomingTxId ?? '-'}
                  />
                  <DetailField
                    label="Certificate id"
                    value={selectedOrder.order.certificateId ?? '-'}
                  />
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200/80 bg-white/80 p-4">
                <p className="m-0 text-sm font-semibold text-slate-950">
                  Asset data
                </p>
                <div className="mt-4 grid gap-4">
                  <DetailField
                    label="Vintage"
                    value={selectedOrder.order.vintage ?? '-'}
                  />
                  <DetailField
                    label="Methodology name"
                    value={selectedOrder.order.methodologyName ?? '-'}
                  />
                  <DetailField
                    label="Mint signature"
                    value={
                      selectedOrder.order.mintSignature ? (
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
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {selectedOrder.order.errorMessage ? (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50/80 p-4">
                <p className="m-0 text-sm font-semibold text-rose-800">
                  Error message
                </p>
                <p className="mt-2 m-0 text-sm leading-6 text-rose-700">
                  {selectedOrder.order.errorMessage}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>List of your orders</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!authenticated ? (
              <div className="grid gap-2 rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-4">
                <p className="m-0 text-sm text-muted-foreground">
                  Use the unified Login flow powered by Privy.
                </p>
                <div className="app-toolbar">
                  <Button onClick={() => login()}>Open Login</Button>
                </div>
                <p className="m-0 text-sm text-muted-foreground">
                  Click Login and choose wallet, email, or Google.
                </p>
              </div>
            ) : (
              <>
                {!hasSolanaWallet ? (
                  <p className="m-0 text-sm text-muted-foreground">
                    Optional: link a Solana wallet to keep wallet-based flows
                    available in the app.
                  </p>
                ) : null}
                <div className="app-toolbar justify-end">
                  {!hasSolanaWallet ? (
                    <Button
                      onClick={() => linkWallet({ walletChainType: 'solana-only' })}
                      variant="outline"
                    >
                      <Wallet className="size-4" />
                      Link Solana wallet
                    </Button>
                  ) : null}
                  <Button
                    className="min-w-28"
                    disabled={groupedOrdersQuery.isFetching}
                    onClick={() => void groupedOrdersQuery.refetch()}
                    variant="outline"
                  >
                    {groupedOrdersQuery.isFetching ? (
                      <>
                        <RotateCw className="size-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RotateCw className="size-4" />
                        Update
                      </>
                    )}
                  </Button>
                </div>
              </>
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
                {authenticated && groupedOrdersQuery.isLoading ? (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={4}>
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : null}

                {authenticated && groupedOrdersQuery.isError ? (
                  <TableRow>
                    <TableCell className="text-destructive" colSpan={4}>
                      Failed to load orders. Try refresh.
                    </TableCell>
                  </TableRow>
                ) : null}

                {authenticated &&
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
                      {row.order.createdAt ? formatDate(row.order.createdAt) : '-'}
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
