import type { GuestCreatedCard } from './guestCreatedCards'

/** Card row from GET /guest-redemptions/assigned-cards → data.cards[] */
export type GuestAssignedCard = {
  source?: 'guest' | 'user' | string
  guest_recipient_id?: string
  amount?: number
  balance?: number
  redemption_code?: string | null
  assigned_at?: string
  guest_cart_item_id?: string
  guest_cart_id?: string
  gift_card_id?: string
  card_type?: string
  product?: string
  description?: string
  currency?: string
  price?: number
  base_price?: number
  markup_amount?: number
  service_fee?: number
  vendor_id?: string | null
  branch_id?: string | null
  branch_name?: string | null
  branch_location?: string | null
  vendor_name?: string | null
  issue_date?: string | null
  expiry_date?: string | null
  status?: string | null
  redeemed?: boolean
  images?: Array<{ file_url?: string; file_name?: string }>
  terms_and_conditions?: Array<{ file_url?: string; file_name?: string }>
}

export type GuestAssignedCardsData = {
  guest_phone?: string
  currency?: string
  cards: GuestAssignedCard[]
}

function normalizeAssignedCardType(card: GuestAssignedCard): string {
  return card.card_type?.trim().toLowerCase() ?? ''
}

/** Checkout purchases assigned to the buyer's own phone (not third-party gifts). */
export function isSelfPurchasedAssignedCard(card: GuestAssignedCard): boolean {
  if (card.redeemed === true) return false
  if (card.source === 'user') return true
  return Boolean(card.guest_cart_id?.trim())
}

/** Cards gifted to this phone by someone else. */
export function isGiftAssignedCard(card: GuestAssignedCard): boolean {
  if (card.redeemed === true) return false
  return !isSelfPurchasedAssignedCard(card)
}

/** DashGo / DashPro use remaining balance; count cards use purchase amount. */
export function getAssignedCardDisplayAmount(card: GuestAssignedCard): number {
  const type = normalizeAssignedCardType(card)
  if (type === 'dashgo' || type === 'dashpro') {
    if (card.balance != null) {
      const parsed = Number(card.balance)
      return Number.isFinite(parsed) ? parsed : 0
    }
  }
  const amount = card.amount ?? card.price ?? 0
  const parsed = Number(amount)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Map assigned-cards row into purchased-card tile shape for guest checkout UI. */
export function mapAssignedCardToPurchasedCard(
  card: GuestAssignedCard,
): GuestCreatedCard | null {
  const guestRecipientId = card.guest_recipient_id?.trim()
  const giftCardId = card.gift_card_id?.trim()
  if (!guestRecipientId && !giftCardId) return null

  const cardType = card.card_type ?? ''
  const amount = getAssignedCardDisplayAmount(card)

  return {
    guest_card_id: guestRecipientId || giftCardId!,
    recipient_id: guestRecipientId || undefined,
    gift_card_id: giftCardId || guestRecipientId!,
    card_type: cardType,
    product: card.product ?? (cardType || 'Gift card'),
    description: card.description ?? null,
    amount,
    price: card.price ?? amount,
    currency: card.currency ?? 'GHS',
    base_price: card.base_price,
    status: 'paid',
    cart_status: 'paid',
    vendor_id: card.vendor_id ?? null,
    vendor_name: card.vendor_name ?? null,
    expiry_date: card.expiry_date ?? null,
    issue_date: card.issue_date ?? null,
    purchased_at: card.assigned_at ?? null,
    redemption_code: card.redemption_code ?? null,
    guest_cart_id: card.guest_cart_id ?? null,
    guest_cart_item_id: card.guest_cart_item_id ?? null,
    created_at: card.assigned_at ?? card.issue_date ?? '',
    images: card.images,
  }
}

export function getAssignedCardDedupeKey(card: GuestAssignedCard): string {
  return [card.guest_recipient_id, card.gift_card_id, card.redemption_code]
    .filter((part) => part != null && String(part).trim() !== '')
    .map(String)
    .join(':')
}

/**
 * Unwrap API envelope from GET /guest-redemptions/assigned-cards.
 * Supports { data: { cards } } and { cards } shapes after axios returns body.
 */
export function parseGuestAssignedCardsResponse(response: unknown): GuestAssignedCardsData {
  if (!response || typeof response !== 'object') {
    return { cards: [] }
  }

  const root = response as Record<string, unknown>
  const payload =
    root.cards != null || root.guest_phone != null || root.currency != null
      ? root
      : (root.data as Record<string, unknown> | undefined)

  if (!payload || typeof payload !== 'object') {
    return { cards: [] }
  }

  const cards = payload.cards
  return {
    guest_phone: typeof payload.guest_phone === 'string' ? payload.guest_phone : undefined,
    currency: typeof payload.currency === 'string' ? payload.currency : 'GHS',
    cards: Array.isArray(cards) ? (cards as GuestAssignedCard[]) : [],
  }
}
