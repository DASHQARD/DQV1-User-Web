import { usePublicCatalogQueries } from './usePublicCatalogQueries'
import {
  PUBLIC_CATALOG_CARDS_QUERY,
  PUBLIC_VENDORS_QUERY,
  PUBLIC_CATALOG_STALE_MS,
} from '../../constants/publicCatalog'

/**
 * Single cards + vendors fetch for the landing page.
 * React Query dedupes when Featured Cards and Partner Vendors both use this hook.
 */
export function useHomePageCatalog() {
  const { usePublicCardsService, usePublicVendors } = usePublicCatalogQueries()

  const { data: publicCards, isLoading: isLoadingCards } = usePublicCardsService(
    PUBLIC_CATALOG_CARDS_QUERY,
    { staleTime: PUBLIC_CATALOG_STALE_MS },
  )

  const { data: vendors, isLoading: isLoadingVendors } = usePublicVendors(
    PUBLIC_VENDORS_QUERY,
    { staleTime: PUBLIC_CATALOG_STALE_MS },
  )

  return {
    publicCards,
    vendors,
    isLoading: isLoadingCards || isLoadingVendors,
    isLoadingCards,
    isLoadingVendors,
  }
}
