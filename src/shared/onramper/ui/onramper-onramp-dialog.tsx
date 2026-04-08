import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, Loader2, Sparkles } from 'lucide-react'
import {
  createOnramperCheckoutIntent,
  fetchOnramperQuotes,
} from '@/shared/api/onramper/requests'
import { useOnramperDefaultsQuery } from '@/shared/api/onramper/queries/use-onramper-defaults-query'
import { useOnramperPaymentTypesQuery } from '@/shared/api/onramper/queries/use-onramper-payment-types-query'
import type { OnramperQuote } from '@/shared/api/onramper/types'
import { getApiErrorMessage } from '@/shared/lib/api-errors'
import { parseLocalizedNumber } from '@/shared/lib/solana'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/ui/toast-provider'

type OnramperOnrampDialogProps = {
  open: boolean
  walletAddress?: string
  onClose: () => void
}

export function OnramperOnrampDialog({
  open,
  walletAddress,
  onClose,
}: OnramperOnrampDialogProps) {
  const [fiatAmount, setFiatAmount] = useState('100')
  const [fiatCurrency, setFiatCurrency] = useState('USD')
  const [destinationCurrency, setDestinationCurrency] = useState('USDC')
  const [countryCode, setCountryCode] = useState('US')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [quotes, setQuotes] = useState<OnramperQuote[]>([])
  const [selectedQuoteId, setSelectedQuoteId] = useState('')
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const { showToast } = useToast()
  const showToastRef = useRef(showToast)
  const defaultsErrorToastRef = useRef<string | null>(null)
  const paymentTypesErrorToastRef = useRef<string | null>(null)

  const defaultsQuery = useOnramperDefaultsQuery(walletAddress, open)
  const paymentTypesQuery = useOnramperPaymentTypesQuery({
    sourceCurrency: fiatCurrency,
    destinationCurrency,
    countryCode,
    enabled: open,
  })

  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.id === selectedQuoteId) ?? null,
    [quotes, selectedQuoteId]
  )
  const fiatCurrencyOptions = useMemo(() => {
    const values = defaultsQuery.data?.availableFiatCurrencies ?? []
    return Array.from(new Set([fiatCurrency, ...values].filter(Boolean)))
  }, [defaultsQuery.data?.availableFiatCurrencies, fiatCurrency])
  const hasPaymentMethodOptions = Boolean(paymentTypesQuery.data?.paymentMethods.length)

  useEffect(() => {
    showToastRef.current = showToast
  }, [showToast])

  useEffect(() => {
    if (!defaultsQuery.data || !open) return

    setFiatAmount((current) =>
      current.length > 0 ? current : String(defaultsQuery.data?.fiatAmount ?? 100)
    )
    setFiatCurrency((current) => current || defaultsQuery.data.fiatCurrency)
    setDestinationCurrency(defaultsQuery.data.destinationCurrency)
    setCountryCode(defaultsQuery.data.countryCode)
    setPaymentMethod((current) => current || defaultsQuery.data.paymentMethod || '')
  }, [defaultsQuery.data, open])

  useEffect(() => {
    setQuotes([])
    setSelectedQuoteId('')
  }, [fiatAmount, fiatCurrency, destinationCurrency, paymentMethod, countryCode])

  useEffect(() => {
    if (!paymentTypesQuery.data?.paymentMethods.length) return

    if (
      paymentMethod &&
      paymentTypesQuery.data.paymentMethods.some((item) => item.id === paymentMethod)
    ) {
      return
    }

    setPaymentMethod(paymentTypesQuery.data.paymentMethods[0]?.id ?? '')
  }, [paymentMethod, paymentTypesQuery.data])

  useEffect(() => {
    if (!open) return

    if (defaultsQuery.isError) {
      const message = getApiErrorMessage(
        defaultsQuery.error,
        'Failed to load Onramper defaults. Using fallback values.'
      )
      if (defaultsErrorToastRef.current === message) {
        return
      }

      defaultsErrorToastRef.current = message
      showToastRef.current({
        type: 'error',
        text: message,
        durationMs: 6000,
      })
      return
    }

    defaultsErrorToastRef.current = null
  }, [defaultsQuery.error, defaultsQuery.isError, open])

  useEffect(() => {
    if (!open || !fiatCurrency || !countryCode) return

    if (paymentTypesQuery.isError) {
      const message = getApiErrorMessage(
        paymentTypesQuery.error,
        'Failed to load payment methods. Quotes will be requested without a method filter.'
      )
      if (paymentTypesErrorToastRef.current === message) {
        return
      }

      paymentTypesErrorToastRef.current = message
      showToastRef.current({
        type: 'error',
        text: message,
        durationMs: 6000,
      })
      return
    }

    paymentTypesErrorToastRef.current = null
  }, [
    countryCode,
    fiatCurrency,
    open,
    paymentTypesQuery.error,
    paymentTypesQuery.isError,
  ])

  function handleClose() {
    if (isLoadingQuotes || isCreatingCheckout) return

    setQuotes([])
    setSelectedQuoteId('')
    onClose()
  }

  async function handleFetchQuotes() {
    if (!walletAddress) {
      showToast({ type: 'error', text: 'Wallet address is missing', durationMs: 5000 })
      return
    }

    let parsedAmount: number
    try {
      parsedAmount = parseLocalizedNumber(fiatAmount)
    } catch (error) {
      showToast({
        type: 'error',
        text: error instanceof Error ? error.message : 'Invalid fiat amount',
        durationMs: 5000,
      })
      return
    }

    if (parsedAmount <= 0) {
      showToast({
        type: 'error',
        text: 'Amount must be greater than zero',
        durationMs: 5000,
      })
      return
    }

    setIsLoadingQuotes(true)

    try {
      const response = await fetchOnramperQuotes({
        walletAddress,
        sourceCurrency: fiatCurrency,
        destinationCurrency,
        fiatAmount: parsedAmount,
        countryCode,
        paymentMethod: paymentMethod || undefined,
      })

      setQuotes(response.quotes)
      setSelectedQuoteId(response.quotes[0]?.id ?? '')

      if (!response.quotes.length) {
        showToast({
          type: 'error',
          text: 'No onramp quotes found for the selected inputs',
          durationMs: 6000,
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        text: getApiErrorMessage(error, 'Failed to load Onramper quotes'),
        durationMs: 6000,
      })
    } finally {
      setIsLoadingQuotes(false)
    }
  }

  async function handleCreateCheckout() {
    if (!walletAddress || !selectedQuote) {
      showToast({
        type: 'error',
        text: 'Select a quote before continuing',
        durationMs: 5000,
      })
      return
    }

    let parsedAmount: number
    try {
      parsedAmount = parseLocalizedNumber(fiatAmount)
    } catch (error) {
      showToast({
        type: 'error',
        text: error instanceof Error ? error.message : 'Invalid fiat amount',
        durationMs: 5000,
      })
      return
    }

    setIsCreatingCheckout(true)

    try {
      const checkout = await createOnramperCheckoutIntent({
        walletAddress,
        quoteId: selectedQuote.id,
        sourceCurrency: fiatCurrency,
        destinationCurrency,
        fiatAmount: parsedAmount,
        paymentMethod: selectedQuote.paymentMethod,
        countryCode,
        redirectUrl: window.location.href,
      })

      window.open(checkout.checkoutUrl, '_blank', 'noopener,noreferrer')
      onClose()
    } catch (error) {
      showToast({
        type: 'error',
        text: getApiErrorMessage(error, 'Failed to create Onramper checkout'),
        durationMs: 6000,
      })
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  return (
    <Dialog onOpenChange={(nextOpen) => !nextOpen && handleClose()} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Top up wallet with Onramper</DialogTitle>
          <DialogDescription className="text-slate-700">
            Compare live onramp quotes and continue to the selected provider checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-cyan-600/10 text-cyan-700">
                <Sparkles className="size-4" />
              </div>
              <div className="grid gap-1">
                <p className="m-0 text-sm font-semibold text-slate-900">
                  Destination wallet
                </p>
                <p className="m-0 break-all text-sm text-slate-600">
                  {walletAddress || 'Wallet is not connected'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Amount</p>
              <Input
                inputMode="decimal"
                onChange={(event) => setFiatAmount(event.target.value)}
                placeholder="100"
                value={fiatAmount}
              />
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Fiat currency</p>
              {fiatCurrencyOptions.length > 1 ? (
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  onChange={(event) => setFiatCurrency(event.target.value)}
                  value={fiatCurrency}
                >
                  {fiatCurrencyOptions.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  onChange={(event) => setFiatCurrency(event.target.value.toUpperCase())}
                  placeholder="USD"
                  value={fiatCurrency}
                />
              )}
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Payment method</p>
              {hasPaymentMethodOptions ? (
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  value={paymentMethod}
                >
                  <option value="">Best available</option>
                  {(paymentTypesQuery.data?.paymentMethods ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input disabled placeholder="Best available" value="" />
              )}
            </div>

            <div className="grid gap-1.5">
              <p className="m-0 text-sm text-slate-700">Country</p>
              <Input
                maxLength={2}
                onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
                placeholder="US"
                value={countryCode}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-600">
            <span>
              Asset: <span className="font-semibold text-slate-900">{destinationCurrency}</span>
            </span>
            {defaultsQuery.isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading Onramper defaults...
              </span>
            ) : null}
            {paymentTypesQuery.isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading payment methods...
              </span>
            ) : null}
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="m-0 text-sm font-semibold text-slate-900">Quotes</p>
                <p className="m-0 text-sm text-slate-600">
                  Best providers for your current amount and payment method.
                </p>
              </div>
              <Button
                disabled={
                  !walletAddress ||
                  !fiatCurrency ||
                  !destinationCurrency ||
                  !countryCode ||
                  isLoadingQuotes ||
                  defaultsQuery.isLoading
                }
                onClick={() => void handleFetchQuotes()}
              >
                {isLoadingQuotes ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Loading quotes...
                  </>
                ) : (
                  'Refresh Quotes'
                )}
              </Button>
            </div>

            <div className="grid gap-3">
              {quotes.length ? (
                quotes.map((quote) => {
                  const isSelected = quote.id === selectedQuoteId

                  return (
                    <button
                      key={quote.id}
                      className={[
                        'grid gap-3 rounded-[22px] border p-4 text-left transition-colors',
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/70'
                          : 'border-slate-200/80 bg-white hover:border-slate-300',
                      ].join(' ')}
                      onClick={() => setSelectedQuoteId(quote.id)}
                      type="button"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <p className="m-0 text-base font-semibold text-slate-900">
                            {quote.provider}
                          </p>
                          <p className="m-0 text-sm text-slate-600">
                            {quote.paymentMethod}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quote.isBestValue ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              Best value
                            </span>
                          ) : null}
                          {quote.badges.map((badge) => (
                            <span
                              key={`${quote.id}-${badge}`}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm text-slate-700 md:grid-cols-4">
                        <p className="m-0">
                          <span className="text-slate-500">Pay:</span>{' '}
                          {formatMoney(quote.fiatAmount, quote.fiatCurrency)}
                        </p>
                        <p className="m-0">
                          <span className="text-slate-500">Receive:</span>{' '}
                          {formatCrypto(quote.cryptoAmount, quote.cryptoCurrency)}
                        </p>
                        <p className="m-0">
                          <span className="text-slate-500">Fee:</span>{' '}
                          {quote.feeAmount && quote.feeCurrency
                            ? formatMoney(quote.feeAmount, quote.feeCurrency)
                            : 'Included'}
                        </p>
                        <p className="m-0">
                          <span className="text-slate-500">ETA:</span>{' '}
                          {quote.estimatedMinutes ? `${quote.estimatedMinutes} min` : 'N/A'}
                        </p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-600">
                  {isLoadingQuotes
                    ? 'Loading quotes...'
                    : 'Set the amount, choose a payment method, and request live quotes.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isLoadingQuotes || isCreatingCheckout}
            onClick={handleClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedQuote || isLoadingQuotes || isCreatingCheckout}
            onClick={() => void handleCreateCheckout()}
          >
            {isCreatingCheckout ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Opening checkout...
              </>
            ) : (
              <>
                Continue to Provider
                <ExternalLink className="size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function formatMoney(amount: number, currency: string) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ` ${currency}`
}

function formatCrypto(amount: number, currency: string) {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }) + ` ${currency}`
}
