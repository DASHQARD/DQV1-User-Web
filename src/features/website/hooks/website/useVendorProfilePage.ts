import { useMemo } from 'react'

import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { normalizePublicVendorsResponse } from '@/features/website/utils/mapPublicVendorsForFilter'
import {
  PUBLIC_CATALOG_STALE_MS,
  PUBLIC_VENDORS_QUERY,
} from '../../constants/publicCatalog'
import { usePublicCatalogQueries } from './usePublicCatalogQueries'

export type VendorProfileRecord = ReturnType<typeof normalizePublicVendorsResponse>[number]

export function useVendorProfilePage(vendorId: string) {
  const { usePublicVendors } = usePublicCatalogQueries()

  const { data: vendorsResponse, isLoading } = usePublicVendors(PUBLIC_VENDORS_QUERY, {
    staleTime: PUBLIC_CATALOG_STALE_MS,
    enabled: Boolean(vendorId),
  })

  const vendor = useMemo((): VendorProfileRecord | null => {
    if (!vendorId) return null
    const id = String(vendorId)
    return (
      normalizePublicVendorsResponse(vendorsResponse).find(
        (v) => String(v.vendor_id ?? v.id) === id,
      ) ?? null
    )
  }, [vendorsResponse, vendorId])

  const displayName = useMemo(() => {
    if (!vendor) return ''
    const raw = vendor.business_name || vendor.vendor_name || vendor.branch_name || ''
    return formatCardDisplayTitle(raw)
  }, [vendor])

  return {
    vendor,
    displayName,
    isLoading,
    vendorsResponse,
  }
}
