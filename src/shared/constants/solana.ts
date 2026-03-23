import { PublicKey } from '@solana/web3.js'

const DEFAULT_MINTER_PDA = 'Dccf2hLZmCDsQypSTYab2E4rbDday4SEEYBV8KTiPMX'
const DEFAULT_CONFIG_PUBKEY = 'CLNJGG3sZ8cxuveemDw9D1tk18q3QCWLWAAwpXumPVY8'

export const MINTER_PDA = import.meta.env.VITE_MINTER_PDA ?? DEFAULT_MINTER_PDA
export const RPC_URL = import.meta.env.VITE_RPC_URL ?? 'https://api.devnet.solana.com'
export const CONFIG_PUBKEY = new PublicKey(
  import.meta.env.VITE_CONFIG_PUBKEY ?? DEFAULT_CONFIG_PUBKEY
)
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
