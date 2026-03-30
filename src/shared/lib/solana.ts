import { Connection, PublicKey } from '@solana/web3.js'

export function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

export async function waitForTransactionConfirmation(
  connection: Connection,
  signature: string,
  timeoutMs = 30_000
) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    const { value } = await connection.getSignatureStatuses([signature])
    const status = value[0]

    if (status?.err) {
      throw new Error('Transaction confirmation failed')
    }

    if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  throw new Error('Transaction confirmation timed out')
}

export function isValidSolanaAddress(value: string) {
  try {
    new PublicKey(value)
    return true
  } catch {
    return false
  }
}

export function normalizeDecimalInput(value: string) {
  return value.trim().replace(',', '.')
}

export function parseLocalizedNumber(value: string) {
  const normalized = normalizeDecimalInput(value)

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Amount must be a valid positive number')
  }

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) {
    throw new Error('Amount must be a valid positive number')
  }

  return parsed
}

export function parseUiAmountToAtomic(value: string, decimals: number) {
  const normalized = normalizeDecimalInput(value)

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error('Amount must be a valid positive number')
  }

  const [wholePart, fractionPart = ''] = normalized.split('.')
  if (fractionPart.length > decimals) {
    throw new Error(`Amount supports up to ${decimals} decimal places`)
  }

  const atomic = `${wholePart}${fractionPart.padEnd(decimals, '0')}`.replace(
    /^0+(?=\d)/,
    ''
  )
  const parsed = Number(atomic || '0')

  if (!Number.isSafeInteger(parsed)) {
    throw new Error('Amount is too large')
  }

  return parsed
}
