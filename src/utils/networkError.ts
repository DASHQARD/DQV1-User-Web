export const NETWORK_ISSUE_MESSAGE =
  'Connection problem. Check your internet connection and try again.'

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return true
  }

  if (!error || typeof error !== 'object') {
    return false
  }

  const err = error as { code?: string; message?: string; status?: number }
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
    return true
  }

  if (err.status === undefined) {
    const message = String(err.message ?? '')
    if (/network error|failed to fetch|load failed|internet connection/i.test(message)) {
      return true
    }
  }

  return false
}

export function resolveRequestErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (isNetworkError(error)) {
    return NETWORK_ISSUE_MESSAGE
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string' &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message
  }

  return fallback
}
