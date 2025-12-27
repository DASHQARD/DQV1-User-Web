import React from 'react'

import { useReducerSpread } from '@/hooks'
import { DEFAULT_QUERY } from '@/utils/constants'

import { usePublicCatalogQueries } from './usePublicCatalogQueries'

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
    limit: 10,
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

  const { usePublicCardsService, usePublicVendors } = usePublicCatalogQueries()
  const { data: publicCards, isLoading } = usePublicCardsService(query)
  const { data: vendorsResponse, isLoading: vendorsLoading } = usePublicVendors({
    ...query,
    limit: query.limit || 20,
    vendor_id: vendor_ids || '',
  })

  // Extract vendors from response
  const vendors = vendorsResponse

  const cardTabs = [
    { id: 'dashx', label: 'DashX' },
    { id: 'dashpro', label: 'DashPro' },
    { id: 'dashpass', label: 'DashPass' },
  ]

  const priceRanges = [
    { label: 'Under ₵25', min: 0, max: 25 },
    { label: '₵25 - ₵50', min: 25, max: 50 },
    { label: '₵50 - ₵100', min: 50, max: 100 },
    { label: '₵100 - ₵250', min: 100, max: 250 },
    { label: '₵250+', min: 250, max: null },
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
