/** Extract a user-facing message from API / axios errors (including our axios interceptor shape). */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error == null) return fallback
  if (typeof error === 'string') return error.trim() || fallback

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message.trim()
    }

    const response = record.response as Record<string, unknown> | undefined
    const data = response?.data

    if (typeof data === 'string' && data.trim()) return data.trim()

    if (data && typeof data === 'object') {
      const body = data as Record<string, unknown>
      if (typeof body.message === 'string' && body.message.trim()) return body.message.trim()
      if (typeof body.error === 'string' && body.error.trim()) return body.error.trim()

      const errors = body.errors
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0]
        if (typeof first === 'string' && first.trim()) return first.trim()
        if (first && typeof first === 'object') {
          const nested = first as Record<string, unknown>
          if (typeof nested.message === 'string' && nested.message.trim()) {
            return nested.message.trim()
          }
        }
      }
    }
  }

  if (error instanceof Error && error.message.trim()) return error.message.trim()

  return fallback
}

/** True when the API rejected a guest cart amount above the guest threshold (e.g. GHS 1,000). */
export function isGuestAmountThresholdMessage(message: string): boolean {
  return /guest transaction threshold|maximum allowed/i.test(message)
}
