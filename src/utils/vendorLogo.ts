import { isAbsoluteMediaUrl } from '@/utils/resolveSignedUrl'

export type VendorLogoFields = {
  logo?: string | null
  logo_key?: string | null
  business_logo?: string | null
  vendor_logo?: string | null
}

/** Pre-signed or absolute logo URL from GET /vendors/all/details (`logo` field). */
export function getVendorLogoDirectUrl(vendor?: VendorLogoFields | null): string | null {
  if (!vendor) return null
  for (const value of [vendor.logo, vendor.business_logo, vendor.vendor_logo]) {
    const trimmed = value?.trim()
    if (trimmed && isAbsoluteMediaUrl(trimmed)) return trimmed
  }
  return null
}

/** Storage key when API returns `logo_key` or a non-URL `logo` string. */
export function getVendorLogoStorageKey(vendor?: VendorLogoFields | null): string | null {
  if (!vendor) return null
  if (getVendorLogoDirectUrl(vendor)) return null

  const candidate =
    vendor.logo_key?.trim() ||
    vendor.vendor_logo?.trim() ||
    vendor.business_logo?.trim() ||
    vendor.logo?.trim() ||
    null

  if (!candidate || isAbsoluteMediaUrl(candidate)) return null
  if (candidate.startsWith('uploads/') || candidate.startsWith('/uploads/')) return null
  return candidate
}
