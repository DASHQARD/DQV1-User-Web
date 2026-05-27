import React from 'react'

import { useReducerSpread } from '@/hooks'
import { DEFAULT_QUERY } from '@/utils/constants'
import { applyApiSafePriceRange } from '@/features/website/utils/priceRangeFilter'

import { PUBLIC_VENDORS_QUERY, PUBLIC_CATALOG_STALE_MS } from '../../constants/publicCatalog'
import { usePublicCatalogQueries } from './usePublicCatalogQueries'

const CARDS_QUERY_DEBOUNCE_MS = 400

export function usePublicCatalog(
  search?: string,
  expiry_date?: string,
  vendor_ids?: string,
  min_price?: string,
  max_price?: string,
  card_type?: string,
  sort_by?: string,
) {
  const [query, setQuery] = useReducerSpread({
    ...DEFAULT_QUERY,
    limit: 50,
    search: '',
    expiry_date: '',
    vendor_ids: '',
    min_price: '',
    max_price: '',
    card_type: '',
    sort_by: '',
  })

  React.useEffect(() => {
    if (search) {
      setQuery({ ...query, search: search.trim() })
    }
    if (expiry_date) {
      setQuery({ ...query, expiry_date: expiry_date.trim() })
    }
    if (vendor_ids) {
      setQuery({ ...query, vendor_ids: vendor_ids.trim() })
    }
    if (min_price) {
      setQuery({ ...query, min_price: min_price.trim() })
    }
    if (max_price) {
      setQuery({ ...query, max_price: max_price.trim() })
    }
    if (card_type) {
      setQuery({ ...query, card_type: card_type.trim() })
    }
    if (sort_by) {
      setQuery({ ...query, sort_by: sort_by.trim() })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setQuery, search, expiry_date, vendor_ids, min_price, max_price, card_type, sort_by])

  const [cardsFetchQuery, setCardsFetchQuery] = React.useState(() => applyApiSafePriceRange(query))

  React.useEffect(() => {
    const safeQuery = applyApiSafePriceRange(query)
    const timer = window.setTimeout(() => setCardsFetchQuery(safeQuery), CARDS_QUERY_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  const { usePublicCardsService, usePublicVendors } = usePublicCatalogQueries()
  const { data: publicCards, isLoading } = usePublicCardsService(cardsFetchQuery)
  const { data: vendorsResponse, isLoading: vendorsLoading } = usePublicVendors(
    PUBLIC_VENDORS_QUERY,
    { staleTime: PUBLIC_CATALOG_STALE_MS },
  )

  const vendors = vendorsResponse

  const cardTabs = [
    { id: 'dashx', label: 'DashX' },
    { id: 'dashpro', label: 'DashPro' },
    { id: 'dashpass', label: 'DashPass' },
    { id: 'dashgo', label: 'DashGo' },
  ]

  const priceRanges = [
    { label: 'Under GHS 25', min: 0, max: 25 },
    { label: 'GHS 25 - GHS 50', min: 25, max: 50 },
    { label: 'GHS 50 - GHS 100', min: 50, max: 100 },
    { label: 'GHS 100 - GHS 250', min: 100, max: 250 },
    { label: 'GHS 250+', min: 250, max: null },
  ]

  return {
    publicCards,
    isLoading,
    query,
    setQuery,
    cardTabs,
    vendors,
    vendorsLoading,
    priceRanges,
  }
}
