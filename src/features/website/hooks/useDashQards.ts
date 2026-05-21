import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { PublicCardResponse } from '@/types/responses'

import { enrichCardsWithVendorLogos } from '@/features/website/utils/enrichCardsWithVendorLogos'
import { usePublicCatalog } from './website'
import { usePublicCatalogQueries } from './website/usePublicCatalogQueries'

export type DashQardsTabId = 'dashx' | 'dashpro' | 'dashpass' | 'dashgo'

export interface DashQardsVendor {
  id: number | string
  vendor_id?: number
  name: string
}

/** Shape of /api/v1/vendors/all/details response */
interface VendorsApiResponse {
  data?: Array<{
    vendor_id?: number
    id?: number
    business_name?: string
    vendor_name?: string
    branch_name?: string
    branches_with_cards?: Array<{ cards?: unknown[] }>
  }>
}

const SORT_ACTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
] as const

function clampNonNegativePrice(price: string | undefined): number | null {
  if (!price) return null
  const parsed = parseFloat(price)
  if (Number.isNaN(parsed)) return null
  return Math.max(0, parsed)
}

function getNormalizedRange(minRaw: string | undefined, maxRaw: string | undefined) {
  const min = clampNonNegativePrice(minRaw)
  const max = clampNonNegativePrice(maxRaw)
  if (min !== null && max !== null && min > max) {
    return { min: max, max: min }
  }
  return { min, max }
}

export function useDashQards() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<DashQardsTabId>('dashx')
  const { publicCards, query, setQuery, cardTabs, priceRanges, vendors: vendorsCatalog } =
    usePublicCatalog()
  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { data: vendorsResponse } = usePublicVendorsService({ limit: 100 })

  const vendors = useMemo((): DashQardsVendor[] => {
    if (!vendorsResponse) return []
    // API can return { data: [...] } or the client may unwrap to the array
    const raw = Array.isArray(vendorsResponse)
      ? vendorsResponse
      : ((vendorsResponse as VendorsApiResponse)?.data ?? [])
    const list = Array.isArray(raw) ? raw : []
    return list
      .filter(
        (v) =>
          (v.branches_with_cards?.length ?? 0) > 0 &&
          (v.branches_with_cards ?? []).some((b) => (b.cards?.length ?? 0) > 0),
      )
      .map((v) => ({
        id: v.vendor_id ?? v.id ?? 0,
        vendor_id: v.vendor_id,
        name: v.business_name || v.vendor_name || 'Unknown Vendor',
      }))
  }, [vendorsResponse])

  const sortBy = query.sort_by || 'popular'

  const allCards = useMemo((): PublicCardResponse[] => {
    if (!publicCards) return []
    const cards = Array.isArray(publicCards)
      ? publicCards
      : Array.isArray((publicCards as { data?: unknown[] })?.data)
        ? (publicCards as { data: unknown[] }).data
        : []
    return enrichCardsWithVendorLogos(
      cards as PublicCardResponse[],
      vendorsCatalog,
    ) as PublicCardResponse[]
  }, [publicCards, vendorsCatalog])

  const filterCardByPrice = useCallback(
    (card: PublicCardResponse) => {
      const cardPrice = parseFloat(String(card.price)) || 0
      const { min: minPrice, max: maxPrice } = getNormalizedRange(query.min_price, query.max_price)
      if (minPrice !== null && cardPrice < minPrice) return false
      if (maxPrice !== null && cardPrice > maxPrice) return false
      return true
    },
    [query.min_price, query.max_price],
  )

  const filteredQardsAll = useMemo(() => {
    return allCards.filter((card) => {
      const cardType = card.type?.toLowerCase()
      if (cardType !== activeTab) return false
      return filterCardByPrice(card)
    })
  }, [allCards, activeTab, filterCardByPrice])

  const sortedQards = filteredQardsAll

  /** Count shown in header and sidebar for the active tab (catalog cards or custom-card flow). */
  const activeResultsCount = useMemo(() => {
    if (activeTab === 'dashpro' || activeTab === 'dashgo') return 1
    return filteredQardsAll.length
  }, [activeTab, filteredQardsAll.length])

  const getCardTypeCount = useCallback(
    (typeId: string) => {
      if (typeId === 'dashpro' || typeId === 'dashgo') return 1
      return allCards.filter((card) => {
        if (card.type?.toLowerCase() !== typeId) return false
        return filterCardByPrice(card)
      }).length
    },
    [allCards, filterCardByPrice],
  )

  const setPriceRange = useCallback(
    (min: number | null | undefined, max: number | null | undefined) => {
      setQuery({
        ...query,
        min_price: min != null ? String(Math.max(0, min)) : undefined,
        max_price: max != null ? String(Math.max(0, max)) : undefined,
      })
    },
    [setQuery, query],
  )

  const isPriceRangeActive = useCallback(
    (min: number | null, max: number | null) => {
      const { min: currentMin, max: currentMax } = getNormalizedRange(
        query.min_price,
        query.max_price,
      )
      if (min === null && max === null) return currentMin === null && currentMax === null
      if (min !== null && max !== null) return currentMin === min && currentMax === max
      if (min !== null && max === null) return currentMin === min && currentMax === null
      return false
    },
    [query.min_price, query.max_price],
  )

  const clearAllFilters = useCallback(() => {
    setQuery({
      ...query,
      min_price: '',
      max_price: '',
      search: '',
      vendor_ids: '',
      sort_by: '',
    })
  }, [setQuery, query])

  const onGetCard = useCallback(
    (card: PublicCardResponse) => {
      if (card.card_id) navigate(`/card/${card.card_id}`)
    },
    [navigate],
  )

  const currentSortLabel = useMemo(() => {
    const action = SORT_ACTIONS.find((a) => a.value === sortBy)
    return action?.label ?? 'Sort by'
  }, [sortBy])

  const setSortBy = useCallback(
    (value: string) => {
      setQuery({ ...query, sort_by: value })
    },
    [setQuery, query],
  )

  return {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    cardTabs,
    priceRanges,
    vendors,
    filteredQardsAll,
    sortedQards,
    activeResultsCount,
    getCardTypeCount,
    setPriceRange,
    isPriceRangeActive,
    clearAllFilters,
    onGetCard,
    sortActions: SORT_ACTIONS,
    currentSortLabel,
    setSortBy,
  }
}
