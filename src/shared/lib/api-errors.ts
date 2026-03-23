import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object') {
      const candidate = data as { message?: unknown; errors?: unknown }
      if (Array.isArray(candidate.errors)) {
        const joined = candidate.errors
          .filter((item): item is string => typeof item === 'string')
          .join(', ')
        if (joined) return joined
      }
      if (typeof candidate.message === 'string' && candidate.message.length > 0) {
        return candidate.message
      }
    }
  }

  return error instanceof Error ? error.message : fallback
}
