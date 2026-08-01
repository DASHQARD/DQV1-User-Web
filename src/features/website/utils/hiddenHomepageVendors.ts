/** Vendor names staged on the homepage that should not appear in marketing carousels. */
const HIDDEN_HOMEPAGE_VENDOR_NAMES = ['melcom', 'aqua safari'] as const

function normalizeVendorLabel(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when a vendor/card should be hidden from homepage featured/partner sections. */
export function isHiddenHomepageVendor(name: unknown): boolean {
  const normalized = normalizeVendorLabel(name)
  if (!normalized) return false
  return HIDDEN_HOMEPAGE_VENDOR_NAMES.some(
    (blocked) => normalized === blocked || normalized.includes(blocked),
  )
}
