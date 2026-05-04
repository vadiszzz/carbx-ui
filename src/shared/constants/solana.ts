import { PublicKey } from '@solana/web3.js'

const DEFAULT_MINTER_PDA = '2iFDwLBrzJB5kjWZ44rtTSY9NNmJmzRMRcLWgwrMFntt'
const DEFAULT_CONFIG_PUBKEY = 'DycUiFgnChfddHwoHY6ququUjRdhXJae2h3aUaP6QRAf'
const DEFAULT_USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export const MINTER_PDA = import.meta.env.VITE_MINTER_PDA ?? DEFAULT_MINTER_PDA
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://api.devnet.solana.com'
export const CONFIG_PUBKEY = new PublicKey(
  import.meta.env.VITE_CONFIG_PUBKEY ?? DEFAULT_CONFIG_PUBKEY
)
export const USDC_MINT = import.meta.env.VITE_USDC_MINT ?? DEFAULT_USDC_MINT
export const SOLSCAN_CLUSTER = RPC_URL.includes('devnet')
  ? 'devnet'
  : RPC_URL.includes('testnet')
    ? 'testnet'
    : null
export const SOLANA_CHAIN = RPC_URL.includes('devnet')
  ? 'solana:devnet'
  : RPC_URL.includes('testnet')
    ? 'solana:testnet'
    : 'solana:mainnet'
