import { AppQueryProvider } from './providers/query-provider'
import { AppPrivyProvider } from './providers/privy-provider'
import { AppRouterProvider } from './providers/router-provider'

function App() {
  return (
    <AppQueryProvider>
      <AppPrivyProvider>
        <AppRouterProvider />
      </AppPrivyProvider>
    </AppQueryProvider>
  )
}

export default App
