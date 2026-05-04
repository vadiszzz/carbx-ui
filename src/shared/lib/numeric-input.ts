export function clampIntegerInput(value: string, max: number) {
  const digitsOnly = value.replace(/\D/g, '')
  if (!digitsOnly) return ''

  const parsed = Number(digitsOnly)
  if (!Number.isFinite(parsed)) return ''

  const safeMax = Math.max(0, Math.floor(max))
  return String(Math.min(parsed, safeMax))
}

export function clampIntegerValue(value: number, max: number) {
  const safeMax = Math.max(0, Math.floor(max))
  const safeValue = Math.max(0, Math.floor(value))
  return Math.min(safeValue, safeMax)
}
