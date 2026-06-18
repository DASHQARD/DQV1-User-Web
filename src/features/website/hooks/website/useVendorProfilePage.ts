import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { formatCardDisplayTitle } from '@/utils/cardDisplay'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { isExactGvidPathLookup } from '@/features/website/utils/cardsRedemption'
import {
  mapVendorRedemptionCatalogToPublicVendor,
  resolveVendorProfileCatalogGvid,
} from '@/features/website/utils/vendorRedemptionCatalog'
import type { PublicVendorRecord } from '@/features/website/utils/mapPublicVendorsForFilter'

export type VendorProfileRecord = PublicVendorRecord

/** Public vendor purchase profile — GET /redemptions/vendors/:gvid/catalog */
export function useVendorProfilePage(gvidParam?: string, legacyVendorId?: string) {
  const queryClient = useQueryClient()
  const { useGetVendorRedemptionCatalogService } = useRedemptionQueries()

  const catalogGvid = useMemo(
    () => resolveVendorProfileCatalogGvid({ gvidParam, legacyVendorId }, queryClient),
    [gvidParam, legacyVendorId, queryClient],
  )

  const { data: catalogResponse, isLoading } = useGetVendorRedemptionCatalogService(
    catalogGvid || undefined,
    undefined,
    Boolean(catalogGvid),
  )

  const vendor = useMemo((): VendorProfileRecord | null => {
    if (!catalogResponse?.data) return null
    const mapped = mapVendorRedemptionCatalogToPublicVendor(catalogResponse.data)
    if (legacyVendorId && !isExactGvidPathLookup(legacyVendorId)) {
      if (String(mapped.vendor_id ?? '') !== String(legacyVendorId)) return null
    }
    return mapped
  }, [catalogResponse, legacyVendorId])

  const displayName = useMemo(() => {
    if (!vendor) return ''
    const raw = vendor.business_name || vendor.vendor_name || vendor.branch_name || ''
    return formatCardDisplayTitle(raw)
  }, [vendor])

  return {
    vendor,
    displayName,
    isLoading,
    catalogGvid,
  }
}
