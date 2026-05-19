export type CheckoutFollowUp =
  | { type: 'redirected' }
  | { type: 'momo_prompt'; data: Record<string, unknown> }
  | { type: 'eganow_3ds'; html: string }
  | { type: 'none' }

function getResponseData(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') return null
  const payload = response as Record<string, unknown>
  const inner = payload.data
  if (inner && typeof inner === 'object') {
    return inner as Record<string, unknown>
  }
  return payload
}

/** Extract payment redirect URL from checkout API responses (handles nested shapes). */
export function extractCheckoutRedirectUrl(response: unknown): string | null {
  if (!response || typeof response !== 'object') {
    return typeof response === 'string' && response.startsWith('http') ? response : null
  }

  const payload = response as Record<string, unknown>

  const directUrl =
    payload.redirect_url ?? payload.payment_url ?? payload.authorization_url
  if (typeof directUrl === 'string' && directUrl.length > 0) {
    return directUrl
  }

  if (typeof payload.data === 'string' && payload.data.startsWith('http')) {
    return payload.data
  }

  const nested = getResponseData(response)
  if (nested) {
    const nestedUrl = nested.redirect_url ?? nested.payment_url ?? nested.authorization_url
    if (typeof nestedUrl === 'string' && nestedUrl.length > 0) {
      return nestedUrl
    }
  }

  return null
}

export function extractEganowRedirectHtml(response: unknown): string | null {
  const nested = getResponseData(response)
  const html = nested?.redirectHtml ?? nested?.redirect_html
  return typeof html === 'string' && html.trim().length > 0 ? html : null
}

function isKowriMomoPrompt(response: unknown): boolean {
  const nested = getResponseData(response)
  if (!nested) return false
  const gateway = String(nested.payment_gateway || '').toLowerCase()
  if (gateway === 'kowri') {
    const redirectUrl = nested.redirect_url
    return typeof redirectUrl !== 'string' || redirectUrl.length === 0
  }
  return false
}

function isEganowMomoPrompt(response: unknown): boolean {
  const nested = getResponseData(response)
  if (!nested) return false
  if (extractEganowRedirectHtml(response)) return false
  if (extractCheckoutRedirectUrl(response)) return false
  const hasEganowFields =
    nested.eganowReferenceNo != null ||
    nested.transactionStatus != null ||
    String(nested.payment_gateway || '').toLowerCase() === 'egnanow'
  const hasReceipt = nested.receipt_number != null
  return Boolean(hasEganowFields && hasReceipt)
}

/** Kowri / Eganow mobile-money: show "approve on phone" UI instead of redirecting. */
export function extractMomoCheckoutPromptData(response: unknown): Record<string, unknown> | null {
  if (!response || typeof response !== 'object') return null
  if (extractCheckoutRedirectUrl(response)) return null
  if (extractEganowRedirectHtml(response)) return null

  if (isKowriMomoPrompt(response) || isEganowMomoPrompt(response)) {
    const nested = getResponseData(response)
    return nested ?? (response as Record<string, unknown>)
  }

  return null
}

/** @deprecated Use extractMomoCheckoutPromptData */
export function extractKowriCheckoutPromptData(response: unknown): Record<string, unknown> | null {
  if (!isKowriMomoPrompt(response)) return null
  return getResponseData(response)
}

export function openEganow3dsChallenge(html: string): void {
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) {
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}

/** Navigate to the payment provider in the current tab. */
export function redirectToCheckoutPaymentPage(response: unknown): boolean {
  const redirectUrl = extractCheckoutRedirectUrl(response)
  if (!redirectUrl) return false
  window.location.replace(redirectUrl)
  return true
}

/** Handle checkout success: redirect, 3DS, or momo prompt. */
export function processCheckoutResponse(response: unknown): CheckoutFollowUp {
  if (redirectToCheckoutPaymentPage(response)) {
    return { type: 'redirected' }
  }

  const eganowHtml = extractEganowRedirectHtml(response)
  if (eganowHtml) {
    openEganow3dsChallenge(eganowHtml)
    return { type: 'eganow_3ds', html: eganowHtml }
  }

  const momoData = extractMomoCheckoutPromptData(response)
  if (momoData) {
    return { type: 'momo_prompt', data: momoData }
  }

  return { type: 'none' }
}
