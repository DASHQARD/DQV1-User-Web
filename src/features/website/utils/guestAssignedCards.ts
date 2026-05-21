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
  images?: Array<{ file_url?: string; file_name?: string }>
  terms_and_conditions?: Array<{ file_url?: string; file_name?: string }>
}

export type GuestAssignedCardsData = {
  guest_phone?: string
  currency?: string
  cards: GuestAssignedCard[]
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
