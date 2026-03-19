/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PRIVY_APP_ID?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_MINTER_PDA?: string
  readonly VITE_BURN_SDK_MODULE?: string
  readonly VITE_CONFIG_PUBKEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
