import { isCatalogCardPurchasable } from '@/utils/cardExpiry'

export type VendorCatalogCard = {
  card_price?: number
  currency?: string
  card_type?: string
  card_status?: string
  expiry_date?: string | null
}

export type VendorBranchWithCards = {
  cards?: VendorCatalogCard[]
}

export type VendorCatalogStats = {
  totalCards: number
  activeBranches: number
  cardTypes: string[]
  minPrice: number | null
  maxPrice: number | null
  currency: string
}

function isActiveCard(card: VendorCatalogCard): boolean {
  return isCatalogCardPurchasable({ card_status: card.card_status, expiry_date: card.expiry_date })
}

const CARD_TYPE_LABELS: Record<string, string> = {
  dashx: 'DashX',
  dashpass: 'DashPass',
  dashgo: 'DashGo',
  dashpro: 'DashPro',
}

function normalizeCardType(type: string): string {
  const trimmed = type.trim()
  if (!trimmed) return 'Gift card'
  const known = CARD_TYPE_LABELS[trimmed.toLowerCase()]
  if (known) return known
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function getVendorCatalogStats(
  branchesWithCards: VendorBranchWithCards[] = [],
): VendorCatalogStats {
  const activeCards = branchesWithCards.flatMap((branch) =>
    (branch.cards ?? []).filter(isActiveCard),
  )

  const prices = activeCards
    .map((card) => card.card_price)
    .filter((price): price is number => typeof price === 'number' && !Number.isNaN(price))

  const cardTypes = [
    ...new Set(
      activeCards
        .map((card) => card.card_type)
        .filter((type): type is string => Boolean(type?.trim()))
        .map(normalizeCardType),
    ),
  ].slice(0, 3)

  const activeBranches = branchesWithCards.filter((branch) =>
    (branch.cards ?? []).some(isActiveCard),
  ).length

  return {
    totalCards: activeCards.length,
    activeBranches,
    cardTypes,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    maxPrice: prices.length > 0 ? Math.max(...prices) : null,
    currency: activeCards.find((card) => card.currency)?.currency ?? 'GHS',
  }
}

export function vendorHasCatalogCards(branchesWithCards: VendorBranchWithCards[] = []): boolean {
  return getVendorCatalogStats(branchesWithCards).totalCards > 0
}
