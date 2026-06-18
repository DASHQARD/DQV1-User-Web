/** Surface backend request API errors verbatim (§10 wrong-level approval attempts). */
export function getRequestApiErrorMessage(
  error: unknown,
  fallback = 'Failed to update request status. Please try again.',
): string {
  if (!error || typeof error !== 'object') return fallback
  const err = error as { message?: unknown; response?: { data?: { message?: unknown } } }
  const fromBody = err.response?.data?.message
  if (fromBody != null && String(fromBody).trim()) return String(fromBody).trim()
  if (err.message != null && String(err.message).trim()) return String(err.message).trim()
  return fallback
}
