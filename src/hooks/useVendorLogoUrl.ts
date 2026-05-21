import { useMemo } from 'react'

import {
  getVendorLogoDirectUrl,
  getVendorLogoStorageKey,
  type VendorLogoFields,
} from '@/utils/vendorLogo'
import { usePresignedMediaUrl } from './usePresignedMediaUrl'

/** Resolves vendor logo from /vendors/all/details (`logo` URL or `logo_key`). */
export function useVendorLogoUrl(vendor?: VendorLogoFields | null) {
  const directUrl = useMemo(() => getVendorLogoDirectUrl(vendor), [vendor])
  const storageKey = useMemo(() => getVendorLogoStorageKey(vendor), [vendor])
  const { url: presignedUrl, isLoading } = usePresignedMediaUrl(storageKey)

  return {
    url: directUrl || presignedUrl || null,
    isLoading: !directUrl && isLoading,
  }
}
