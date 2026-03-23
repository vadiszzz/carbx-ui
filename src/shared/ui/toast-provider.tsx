import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'

export type ToastType = 'info' | 'success' | 'error'

export type ToastItem = {
  id: number
  type: ToastType
  text: string
  signature?: string
}

type ShowToastInput = {
  type: ToastType
  text: string
  signature?: string
  durationMs?: number
}

type UpdateToastInput = Partial<Omit<ToastItem, 'id'>> & {
  durationMs?: number
}

type ToastContextValue = {
  toasts: ToastItem[]
  showToast: (input: ShowToastInput) => number
  updateToast: (id: number, patch: UpdateToastInput) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function AppToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(1)

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }

  function scheduleDismiss(id: number, durationMs?: number) {
    if (!durationMs) return

    setTimeout(() => {
      dismissToast(id)
    }, durationMs)
  }

  function showToast(input: ShowToastInput) {
    const id = idRef.current++
    setToasts((prev) => [
      ...prev,
      {
        id,
        type: input.type,
        text: input.text,
        signature: input.signature,
      },
    ])
    scheduleDismiss(id, input.durationMs)
    return id
  }

  function updateToast(id: number, patch: UpdateToastInput) {
    setToasts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    )
    scheduleDismiss(id, patch.durationMs)
  }

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      showToast,
      updateToast,
      dismissToast,
    }),
    [toasts]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
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
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside AppToastProvider')
  }

  return context
}
