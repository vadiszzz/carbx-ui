import type { VintageToken } from '@/shared/lib/vintage-tokens'

const MOCK_WALLET = '9RMPunW8iLiwxUMXXp8GKMZboX7urnJkwYTsn1xNSAYp'
const OTHER_WALLET_A = '7xAgB3kqFJ8tNvLm2eKpQrXyZ5wCdEfGhIjKlMnOpQrS'
const OTHER_WALLET_B = '4nPqRsTuVwXyZ1aBcDeFgHiJkLmNoPqRsTuVwXyZ2bCd'
const REGISTRY = 'PuroRegistry111111111111111111111111111111'
const RENT_PAYER = '1NRentPayer11111111111111111111111111111111'
const PAYMENT_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export type MockListing = {
  publicKey: string
  user: string
  vintageMint: string
  registry: string
  rentPayer: string
  paymentMint: string
  amountToSell: string
  unitPrice: string
  createdAt: string
}

export const MOCK_LISTINGS: MockListing[] = [
  {
    publicKey: 'mock-listing-amazon',
    user: OTHER_WALLET_A,
    vintageMint: 'MockMintAmazon11111111111111111111111111111',
    registry: REGISTRY,
    rentPayer: RENT_PAYER,
    paymentMint: PAYMENT_MINT,
    amountToSell: '2450',
    unitPrice: '12000000',
    createdAt: '1714521600',
  },
  {
    publicKey: 'mock-listing-dac',
    user: OTHER_WALLET_B,
    vintageMint: 'MockMintDAC1111111111111111111111111111111',
    registry: REGISTRY,
    rentPayer: RENT_PAYER,
    paymentMint: PAYMENT_MINT,
    amountToSell: '840',
    unitPrice: '28500000',
    createdAt: '1714435200',
  },
  {
    publicKey: 'mock-listing-soil',
    user: MOCK_WALLET,
    vintageMint: 'MockMintSoil1111111111111111111111111111111',
    registry: REGISTRY,
    rentPayer: RENT_PAYER,
    paymentMint: PAYMENT_MINT,
    amountToSell: '120',
    unitPrice: '16000000',
    createdAt: '1714348800',
  },
  {
    publicKey: 'mock-listing-biochar',
    user: OTHER_WALLET_A,
    vintageMint: 'MockMintBiochar11111111111111111111111111',
    registry: REGISTRY,
    rentPayer: RENT_PAYER,
    paymentMint: PAYMENT_MINT,
    amountToSell: '1620',
    unitPrice: '95000000',
    createdAt: '1714262400',
  },
]

export const MOCK_TOKENS: VintageToken[] = [
  {
    mint: 'MockMintAmazon11111111111111111111111111111',
    name: 'Amazon Reforestation 2024',
    symbol: 'AMZF24',
    uri: null,
    tokenInfo: { decimals: 0, supply: '2450', token_program: '', associated_token_address: '' } as VintageToken['tokenInfo'],
  },
  {
    mint: 'MockMintDAC1111111111111111111111111111111',
    name: 'Direct Air Capture Iceland 2024',
    symbol: 'DAC24',
    uri: null,
    tokenInfo: { decimals: 0, supply: '840', token_program: '', associated_token_address: '' } as VintageToken['tokenInfo'],
  },
  {
    mint: 'MockMintSoil1111111111111111111111111111111',
    name: 'Boreal Soil Carbon 2023',
    symbol: 'SOIL23',
    uri: null,
    tokenInfo: { decimals: 0, supply: '120', token_program: '', associated_token_address: '' } as VintageToken['tokenInfo'],
  },
  {
    mint: 'MockMintBiochar11111111111111111111111111',
    name: 'Kenyan Biochar 2024',
    symbol: 'BIOC24',
    uri: null,
    tokenInfo: { decimals: 0, supply: '1620', token_program: '', associated_token_address: '' } as VintageToken['tokenInfo'],
  },
]

export const MOCK_LOCATIONS: Record<string, string> = {
  'MockMintAmazon11111111111111111111111111111': 'Brazil',
  'MockMintDAC1111111111111111111111111111111': 'Iceland',
  'MockMintSoil1111111111111111111111111111111': 'Canada',
  'MockMintBiochar11111111111111111111111111': 'Kenya',
}

export type MockProjectDetail = {
  description: string
  methodology: string
  certificateId: string
  projectStart: string
  developer: string
  puroUrl: string
}

export const MOCK_PROJECT_DETAILS: Record<string, MockProjectDetail> = {
  'MockMintAmazon11111111111111111111111111111': {
    description:
      'Reforestation of degraded pasture in the Brazilian Amazon, restoring native species across 1,200 hectares. Permanence backed by a 100-year buffer pool and biannual remote-sensing audits.',
    methodology: 'Puro Standard — Forestation (v3)',
    certificateId: 'PURO_PR_CORC100+_BR_24_AMZ_004',
    projectStart: 'March 2024',
    developer: 'Mata Atlântica Restauração',
    puroUrl: 'https://registry.puro.earth/certificate/PURO_PR_CORC100+_BR_24_AMZ_004',
  },
  'MockMintDAC1111111111111111111111111111111': {
    description:
      'Direct air capture facility powered by Iceland\'s geothermal grid. Captured CO₂ is mineralized into basalt formations underground for permanent geological storage. Verified durability >10,000 years.',
    methodology: 'Puro Standard — Geologically Stored Carbon (v2)',
    certificateId: 'PURO_PR_CORC100+_IS_24_DAC_001',
    projectStart: 'September 2024',
    developer: 'Climeworks-style Operator (mock)',
    puroUrl: 'https://registry.puro.earth/certificate/PURO_PR_CORC100+_IS_24_DAC_001',
  },
  'MockMintSoil1111111111111111111111111111111': {
    description:
      'Boreal soil organic carbon enrichment across 4,500 hectares of Canadian boreal farmland. Cover cropping and reduced tillage practices increase soil carbon stocks, monitored via in-soil sampling and satellite NDVI.',
    methodology: 'Puro Standard — Soil Organic Carbon (v1)',
    certificateId: 'PURO_PR_CORC100+_CA_23_SOC_012',
    projectStart: 'June 2023',
    developer: 'Northern Plains Carbon Co-op',
    puroUrl: 'https://registry.puro.earth/certificate/PURO_PR_CORC100+_CA_23_SOC_012',
  },
  'MockMintBiochar11111111111111111111111111': {
    description:
      'Smallholder biochar production from agricultural residues across the Kenyan Rift Valley. Biomass is pyrolyzed at 550°C, producing stable carbon applied to soil. Co-benefits include improved smallholder yields and reduced burn pollution.',
    methodology: 'Puro Standard — Biochar (v3)',
    certificateId: 'PURO_PR_CORC100+_KE_24_BIO_088',
    projectStart: 'January 2024',
    developer: 'Kenya Biochar Cooperative',
    puroUrl: 'https://registry.puro.earth/certificate/PURO_PR_CORC100+_KE_24_BIO_088',
  },
}
