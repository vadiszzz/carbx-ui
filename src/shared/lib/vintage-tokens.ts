export type DasAsset = {
  id?: string
  authorities?: Array<{ address?: string }>
  content?: {
    metadata?: {
      name?: string | null
      symbol?: string | null
    }
    json_uri?: string | null
  }
  token_info?: {
    symbol?: string | null
    balance?: number | null
    decimals?: number | null
    ui_amount?: number | null
    uiAmount?: number | null
  } | null
}

type DasResponse = {
  result?: {
    items?: DasAsset[]
  }
}

type DasAssetResponse = {
  result?: DasAsset
}

export type VintageToken = {
  mint: string
  name: string | null
  symbol: string | null
  uri: string | null
  tokenInfo: DasAsset['token_info']
}

export async function getVintageTokens(params: {
  ownerAddress: string
  rpcUrl: string
  minterPda: string
}): Promise<VintageToken[]> {
  const body = {
    jsonrpc: '2.0',
    id: 'vintage-assets',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress: params.ownerAddress,
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showNativeBalance: false,
      },
    },
  }

  const response = await fetch(params.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as DasResponse
  const items = data.result?.items ?? []

  const ours = items.filter(
    (asset) =>
      Array.isArray(asset.authorities) &&
      asset.authorities.some((authority) => authority?.address === params.minterPda)
  )

  return ours.map((asset) => ({
    mint: asset.id ?? '-',
    name: asset.content?.metadata?.name ?? asset.content?.metadata?.symbol ?? null,
    symbol: asset.content?.metadata?.symbol ?? asset.token_info?.symbol ?? null,
    uri: asset.content?.json_uri ?? null,
    tokenInfo: asset.token_info ?? null,
  }))
}

async function getAssetById(params: { rpcUrl: string; id: string }) {
  const response = await fetch(params.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `asset-${params.id}`,
      method: 'getAsset',
      params: {
        id: params.id,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as DasAssetResponse
  return data.result ?? null
}

function mapDasAssetToVintageToken(asset: DasAsset | null): VintageToken | null {
  if (!asset?.id) return null

  return {
    mint: asset.id,
    name: asset.content?.metadata?.name ?? asset.content?.metadata?.symbol ?? null,
    symbol: asset.content?.metadata?.symbol ?? asset.token_info?.symbol ?? null,
    uri: asset.content?.json_uri ?? null,
    tokenInfo: asset.token_info ?? null,
  }
}

export async function getVintageTokensByMints(params: {
  mints: string[]
  rpcUrl: string
}) {
  const uniqueMints = [...new Set(params.mints.filter(Boolean))]
  const assets = await Promise.all(
    uniqueMints.map((mint) => getAssetById({ rpcUrl: params.rpcUrl, id: mint }))
  )

  return assets
    .map((asset) => mapDasAssetToVintageToken(asset))
    .filter((asset): asset is VintageToken => asset !== null)
}

export function formatVintageTokenAmount(token: VintageToken) {
  const uiAmount = token.tokenInfo?.ui_amount ?? token.tokenInfo?.uiAmount
  if (typeof uiAmount === 'number') return String(uiAmount)

  const balance = token.tokenInfo?.balance
  const decimals = token.tokenInfo?.decimals
  if (typeof balance === 'number' && typeof decimals === 'number') {
    return String(balance / 10 ** decimals)
  }

  return '-'
}

export function formatSolanaAddressShort(value: string) {
  if (value.length <= 14) return value
  return `${value.slice(0, 6)}...${value.slice(-6)}`
}

export function getSolscanTokenUrl(mint: string, cluster: string | null) {
  if (cluster) {
    return `https://solscan.io/token/${mint}?cluster=${cluster}`
  }

  return `https://solscan.io/token/${mint}`
}
