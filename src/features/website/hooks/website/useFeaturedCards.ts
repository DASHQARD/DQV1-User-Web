import { useState, useMemo } from 'react'
import { usePublicCatalog } from './usePublicCatalog'

export type FeaturedCardsTabType = 'dashx' | 'dashpass'

const TAB_OPTIONS: { value: FeaturedCardsTabType; label: string }[] = [
  { value: 'dashx', label: 'DashX' },
  { value: 'dashpass', label: 'DashPass' },
]

const FEATURED_LIMIT = 4

export function useFeaturedCards() {
  const { publicCards, isLoading } = usePublicCatalog()
  const [activeTab, setActiveTab] = useState<FeaturedCardsTabType>('dashx')

  const filteredCards = useMemo(() => {
    if (!publicCards) return []
    const normalizedTargetType = activeTab.toLowerCase()
    return publicCards
      .filter((card: { type?: string }) => {
        const cardType = card.type?.toString().toLowerCase().trim() || ''
        return cardType === normalizedTargetType
      })
      .slice(0, FEATURED_LIMIT)
  }, [publicCards, activeTab])

  return {
    activeTab,
    setActiveTab,
    tabOptions: TAB_OPTIONS,
    filteredCards,
    isLoading,
  }
}
