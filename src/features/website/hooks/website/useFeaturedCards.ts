import { useMemo } from 'react'
import {
  enrichCardsWithVendorLogos,
  type CardWithVendorId,
} from '@/features/website/utils/enrichCardsWithVendorLogos'
import { isCatalogCardPurchasable } from '@/utils/cardExpiry'
import { useHomePageCatalog } from './useHomePageCatalog'

export type FeaturedCardSectionId = 'dashx' | 'dashpass'

export type FeaturedCardSection = {
  id: FeaturedCardSectionId
  label: string
  cards: CardWithVendorId[]
}

const FEATURED_SECTIONS: { id: FeaturedCardSectionId; label: string }[] = [
  { id: 'dashx', label: 'DashX' },
  { id: 'dashpass', label: 'DashPass' },
]

const FEATURED_LIMIT = 4

function normalizeCards(publicCards: unknown): CardWithVendorId[] {
  if (!publicCards) return []
  if (Array.isArray(publicCards)) return publicCards as CardWithVendorId[]
  if (Array.isArray((publicCards as { data?: unknown[] })?.data)) {
    return (publicCards as { data: CardWithVendorId[] }).data
  }
  return []
}

export function useFeaturedCards() {
  const { publicCards, vendors: vendorsResponse, isLoading } = useHomePageCatalog()

  const sections = useMemo((): FeaturedCardSection[] => {
    const cards = normalizeCards(publicCards)

    return FEATURED_SECTIONS.map(({ id, label }) => {
      const byType = cards.filter((card) => {
        const cardType = String(card.type ?? '')
          .toLowerCase()
          .trim()
        if (cardType !== id) return false
        return isCatalogCardPurchasable({
          status: (card as { status?: string }).status,
          expiry_date: (card as { expiry_date?: string }).expiry_date,
        })
      })
      const enriched = enrichCardsWithVendorLogos(byType, vendorsResponse)
      return {
        id,
        label,
        cards: enriched.slice(0, FEATURED_LIMIT),
      }
    })
  }, [publicCards, vendorsResponse])

  return {
    sections,
    isLoading,
  }
}
