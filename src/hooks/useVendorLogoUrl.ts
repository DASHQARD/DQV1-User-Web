import { useMemo } from 'react'

import { resolveMediaUrl } from '@/utils/cardDisplay'
import {
  getVendorLogoDirectUrl,
  getVendorLogoStorageKey,
  type VendorLogoFields,
} from '@/utils/vendorLogo'

/** Resolves vendor logo from /vendors/all/details (`logo` URL or storage key). */
export function useVendorLogoUrl(vendor?: VendorLogoFields | null) {
  const url = useMemo(() => {
    const directUrl = getVendorLogoDirectUrl(vendor)
    if (directUrl) return directUrl
    const storageKey = getVendorLogoStorageKey(vendor)
    return resolveMediaUrl(storageKey)
  }, [vendor])

  return {
    url,
    isLoading: false,
  }
}
