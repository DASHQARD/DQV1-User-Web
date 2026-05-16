/** Extract payment redirect URL from checkout API responses (handles nested shapes). */
export function extractCheckoutRedirectUrl(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return typeof response === 'string' && response.startsWith('http') ? response : null
  }

  const payload = response as Record<string, unknown>

  const directUrl = payload.redirect_url ?? payload.payment_url
  if (typeof directUrl === 'string' && directUrl.length > 0) {
    return directUrl
  }

  if (typeof payload.data === 'string' && payload.data.startsWith('http')) {
    return payload.data
  }

  if (payload.data && typeof payload.data === 'object') {
    const nested = payload.data as Record<string, unknown>
    const nestedUrl = nested.redirect_url ?? nested.payment_url
    if (typeof nestedUrl === 'string' && nestedUrl.length > 0) {
      return nestedUrl
    }
  }

  return null
}

function isKowriPromptResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false
  const payload = response as Record<string, unknown>
  const inner = payload.data
  if (!inner || typeof inner !== 'object') return false
  return String((inner as Record<string, unknown>).payment_gateway || '').toLowerCase() === 'kowri'
}

/** Kowri mobile-money checkout returns prompt data in `data` instead of a redirect URL. */
export function extractKowriCheckoutPromptData(response: unknown): Record<string, unknown> | null {
  if (!isKowriPromptResponse(response)) return null
  const payload = response as Record<string, unknown>
  const inner = payload.data
  if (!inner || typeof inner !== 'object') return null
  return inner as Record<string, unknown>
}

/** Navigate to the payment provider in the current tab. */
export function redirectToCheckoutPaymentPage(response: unknown): boolean {
  if (isKowriPromptResponse(response)) return false

  const redirectUrl = extractCheckoutRedirectUrl(response)
  if (!redirectUrl) return false
  window.location.replace(redirectUrl)
  return true
}
