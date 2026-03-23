import { Connection } from '@solana/web3.js'

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
