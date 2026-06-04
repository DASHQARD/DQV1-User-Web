import type { GuestAssignedCard } from '@/features/website/utils/guestAssignedCards'
import type { GuestCreatedCard } from '@/features/website/utils/guestCreatedCards'
import { isAssignedCardRedeemable } from '@/utils/cardExpiry'
import { resolveRedemptionCardId } from '@/features/website/utils/guestRedemption'
import { buildRedemptionUrl, buildRedemptionUrlFromCard } from '@/features/website/utils/redemptionDeepLink'

function normalizeCardType(type: string | undefined): string {
  return type?.toLowerCase().trim() ?? ''
}

function isPaidPurchasedStatus(card: GuestCreatedCard): boolean {
  const status = String(card.cart_status ?? card.status ?? '').toLowerCase()
  return (
    status === 'paid' ||
    status === 'active' ||
    status === 'approved' ||
    status === 'completed' ||
    status === 'success'
  )
}

/** Guest purchased card can open redeem with a meaningful deep link. */
export function isGuestPurchasedCardRedeemNavigable(card: GuestCreatedCard): boolean {
  if (!isPaidPurchasedStatus(card)) return false
  const type = normalizeCardType(card.card_type)
  if (type === 'dashpro') return true
  return Boolean(card.vendor_id?.trim())
}

/** Assigned guest card can open redeem when still redeemable. */
export function isGuestAssignedCardRedeemNavigable(card: GuestAssignedCard): boolean {
  if (card.redeemed) return false
  return isAssignedCardRedeemable(card)
}

export function buildRedemptionUrlFromGuestPurchasedCard(
  card: GuestCreatedCard,
): string | null {
  const cardType = normalizeCardType(card.card_type)
  if (!cardType) return null

  if (cardType === 'dashpro') {
    return buildRedemptionUrl({
      method: 'vendor_mobile_money',
      card_type: 'dashpro',
    })
  }

  if (!card.vendor_id?.trim()) return null

  const redemptionCardId =
    card.gift_card_id?.trim() ||
    card.card_id?.trim() ||
    card.card_reference?.trim() ||
    undefined

  return buildRedemptionUrlFromCard({
    card_type: cardType,
    vendor_id: card.vendor_id,
    card_id: redemptionCardId,
  })
}

export function buildRedemptionUrlFromGuestAssignedCard(
  card: GuestAssignedCard,
): string | null {
  const cardType = normalizeCardType(card.card_type)
  if (!cardType) return null

  if (cardType === 'dashpro') {
    return buildRedemptionUrl({
      method: 'vendor_mobile_money',
      card_type: 'dashpro',
    })
  }

  if (!card.vendor_id?.trim()) return null

  const redemptionCardId = resolveRedemptionCardId(card as Record<string, unknown>)
  if (!redemptionCardId) return null

  return buildRedemptionUrlFromCard({
    card_type: cardType,
    vendor_id: card.vendor_id,
    branch_id: card.branch_id ?? undefined,
    card_id: redemptionCardId,
  })
}

export type RedemptionVendorCardLike = {
  card_id: string
  branch_id?: string
  recipient_id?: string
  cart_item_id?: string
}

/** Match a deep-linked card id to a row in the redeem UI card list. */
export function findRedemptionCardInList<T extends RedemptionVendorCardLike>(
  cards: T[],
  targetCardId: string,
  options?: { branchId?: string | null },
): T | undefined {
  const target = targetCardId.trim()
  if (!target) return undefined
  const branchId = options?.branchId?.trim()

  const scoped =
    branchId != null && branchId !== ''
      ? cards.filter((c) => String(c.branch_id ?? '') === branchId)
      : cards

  return scoped.find(
    (c) =>
      String(c.card_id) === target ||
      String(c.cart_item_id ?? '') === target ||
      String(c.recipient_id ?? '') === target,
  )
}
