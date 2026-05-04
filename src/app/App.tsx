import { AppQueryProvider } from './providers/query-provider'
import { AppPrivyProvider } from './providers/privy-provider'
import { AppRouterProvider } from './providers/router-provider'
import { AppToastProvider } from '@/shared/ui/toast-provider'
import { ErrorBoundary } from '@/shared/ui/error-boundary'

function App() {
  return (
    <ErrorBoundary>
      <AppQueryProvider>
        <AppPrivyProvider>
          <AppToastProvider>
            <AppRouterProvider />
          </AppToastProvider>
        </AppPrivyProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  )
}

export default App
