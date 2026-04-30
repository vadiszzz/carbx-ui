import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error('Unhandled error in app:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-foreground">
          <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-border bg-card p-8 text-center shadow-card">
            <div className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Something went wrong
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The page hit an unexpected error and couldn’t finish loading.
                Try reloading — if it keeps happening, let the team know.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error.message ? (
              <pre className="max-h-40 w-full overflow-auto rounded-lg border border-border bg-muted p-3 text-left text-xs text-foreground">
                {this.state.error.message}
              </pre>
            ) : null}

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RotateCw className="size-4" />
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
