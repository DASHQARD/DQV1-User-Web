import { useState, useMemo } from 'react'
import {
  enrichCardsWithVendorLogos,
  type CardWithVendorId,
} from '@/features/website/utils/enrichCardsWithVendorLogos'
import { usePublicCatalog } from './usePublicCatalog'
import { usePublicCatalogQueries } from './usePublicCatalogQueries'

export type FeaturedCardsTabType = 'dashx' | 'dashpass'

const TAB_OPTIONS: { value: FeaturedCardsTabType; label: string }[] = [
  { value: 'dashx', label: 'DashX' },
  { value: 'dashpass', label: 'DashPass' },
]

const FEATURED_LIMIT = 4

export function useFeaturedCards() {
  const { publicCards, isLoading: cardsLoading } = usePublicCatalog()
  const { usePublicVendors } = usePublicCatalogQueries()
  const { data: vendorsResponse, isLoading: vendorsLoading } = usePublicVendors({ limit: 100 })
  const [activeTab, setActiveTab] = useState<FeaturedCardsTabType>('dashx')

  const filteredCards = useMemo(() => {
    if (!publicCards) return []
    const cards = Array.isArray(publicCards)
      ? publicCards
      : Array.isArray((publicCards as { data?: unknown[] })?.data)
        ? (publicCards as { data: unknown[] }).data
        : []
    const normalizedTargetType = activeTab.toLowerCase()
    const typedCards = cards as CardWithVendorId[]
    const byType = typedCards.filter((card) => {
      const cardType = String(card.type ?? '')
        .toLowerCase()
        .trim()
      return cardType === normalizedTargetType
    })
    const enriched = enrichCardsWithVendorLogos(byType, vendorsResponse)
    return enriched.slice(0, FEATURED_LIMIT)
  }, [publicCards, activeTab, vendorsResponse])

  const isLoading = cardsLoading || vendorsLoading

  return {
    activeTab,
    setActiveTab,
    tabOptions: TAB_OPTIONS,
    filteredCards,
    isLoading,
  }
}
