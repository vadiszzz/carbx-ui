import type { VintageToken } from '@/shared/lib/vintage-tokens'
import type { VintageRegistryMeta } from '../model'

export const MOCK_HOLDINGS: VintageToken[] = [
  {
    mint: 'MockMintAmazon11111111111111111111111111111',
    name: 'Amazon Reforestation 2024',
    symbol: 'AMZF24',
    uri: null,
    tokenInfo: {
      decimals: 0,
      supply: '200',
      balance: 200,
      token_program: '',
      associated_token_address: '',
    } as VintageToken['tokenInfo'],
  },
  {
    mint: 'MockMintDAC1111111111111111111111111111111',
    name: 'Direct Air Capture Iceland 2024',
    symbol: 'DAC24',
    uri: null,
    tokenInfo: {
      decimals: 0,
      supply: '25',
      balance: 25,
      token_program: '',
      associated_token_address: '',
    } as VintageToken['tokenInfo'],
  },
  {
    mint: 'MockMintBiochar11111111111111111111111111',
    name: 'Kenyan Biochar 2024',
    symbol: 'BIOC24',
    uri: null,
    tokenInfo: {
      decimals: 0,
      supply: '80',
      balance: 80,
      token_program: '',
      associated_token_address: '',
    } as VintageToken['tokenInfo'],
  },
]

export const MOCK_REGISTRY_META: VintageRegistryMeta[] = [
  { tokenMint: 'MockMintAmazon11111111111111111111111111111', companyId32: 'amazon-mock', year: 2024 },
  { tokenMint: 'MockMintDAC1111111111111111111111111111111', companyId32: 'dac-mock', year: 2024 },
  { tokenMint: 'MockMintBiochar11111111111111111111111111', companyId32: 'biochar-mock', year: 2024 },
  { tokenMint: 'MockMintSoil1111111111111111111111111111111', companyId32: 'soil-mock', year: 2023 },
]
