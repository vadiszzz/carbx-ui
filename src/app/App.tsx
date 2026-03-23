import { AppQueryProvider } from './providers/query-provider'
import { AppPrivyProvider } from './providers/privy-provider'
import { AppRouterProvider } from './providers/router-provider'
import { AppToastProvider } from '@/shared/ui/toast-provider'

function App() {
  return (
    <AppQueryProvider>
      <AppPrivyProvider>
        <AppToastProvider>
          <AppRouterProvider />
        </AppToastProvider>
      </AppPrivyProvider>
    </AppQueryProvider>
  )
}

export default App
