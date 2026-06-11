import type { CardMetricsDetail } from '@/types'
import type { CardType } from '@/utils/constants/cards'

/** DashPro / DashGo — monetary balance from `unredeemed_amount`. */
export function isBalanceCardType(cardType: CardType): boolean {
  return cardType === 'dashpro' || cardType === 'dashgo'
}

/** DashX / DashPass — count cards; no redeemable balance on metrics/details. */
export function isCountCardType(cardType: CardType): boolean {
  return cardType === 'dashx' || cardType === 'dashpass'
}

function normalizeMetricsCardType(type?: string | null): CardType | undefined {
  const normalized = type?.trim().toLowerCase()
  if (normalized === 'dashpro' || normalized === 'dashgo' || normalized === 'dashx' || normalized === 'dashpass') {
    return normalized
  }
  return undefined
}

/** Balance card types only — never falls back to masked `price`. */
export function parseCardMetricsUnredeemedBalance(
  card: Pick<CardMetricsDetail, 'unredeemed_amount'>,
): number {
  const parsed = parseFloat(card.unredeemed_amount ?? '0')
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Display balance for `/cards/users/metrics/details` rows.
 * - DashPro / DashGo → `unredeemed_amount`
 * - DashX / DashPass → null (show metadata only)
 */
export function getCardMetricsDisplayBalance(
  card: Pick<CardMetricsDetail, 'unredeemed_amount' | 'type'>,
  cardType: CardType,
): number | null {
  if (isCountCardType(cardType)) return null
  if (isBalanceCardType(cardType)) return parseCardMetricsUnredeemedBalance(card)
  const fromApi = normalizeMetricsCardType(card.type)
  if (fromApi && isCountCardType(fromApi)) return null
  if (fromApi && isBalanceCardType(fromApi)) return parseCardMetricsUnredeemedBalance(card)
  return null
}

export function shouldShowCardMetricsBalance(cardType: CardType): boolean {
  return isBalanceCardType(cardType)
}

export function formatCardMetricsBalanceCell(row: {
  type?: string | null
  unredeemed_amount?: string | null
  currency?: string | null
}): string {
  const cardType = normalizeMetricsCardType(row.type)
  if (cardType && isCountCardType(cardType)) return '—'
  if (cardType && isBalanceCardType(cardType)) {
    if (!row.unredeemed_amount?.trim()) return '—'
    return `${row.currency?.trim() || 'GHS'} ${row.unredeemed_amount}`
  }
  if (row.unredeemed_amount?.trim()) {
    return `${row.currency?.trim() || 'GHS'} ${row.unredeemed_amount}`
  }
  return '—'
}
