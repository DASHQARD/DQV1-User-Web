/** Flattened row from GET /guest-cards → data[] items ({ guest_card, gift_card }). */
export type GuestCreatedCard = {
  guest_card_id: string
  gift_card_id: string
  card_id?: string
  card_type: string
  product: string
  amount: number
  price: number
  currency: string
  base_price?: number
  service_fee?: number
  status: string
  gift_card_status?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  created_at: string
  updated_at?: string
}

function parseAmount(value: unknown): number {
  if (value == null || value === '') return 0
  const num = typeof value === 'number' ? value : Number(String(value))
  return Number.isFinite(num) ? num : 0
}

function mapNestedGuestCardRow(row: Record<string, unknown>): GuestCreatedCard | null {
  const guestCard = row.guest_card as Record<string, unknown> | undefined
  const giftCard = row.gift_card as Record<string, unknown> | undefined
  if (!guestCard && !giftCard) return null

  const guestCardId = String(guestCard?.id ?? row.guest_card_id ?? '')
  const giftCardId = String(guestCard?.gift_card_id ?? giftCard?.id ?? '')
  if (!guestCardId && !giftCardId) return null

  const cardType = String(guestCard?.card_type ?? giftCard?.type ?? '')
  const product = String(giftCard?.product ?? (cardType || 'Gift card'))
  const amount = parseAmount(guestCard?.amount ?? giftCard?.price)
  const price = parseAmount(giftCard?.price ?? guestCard?.amount)

  return {
    guest_card_id: guestCardId,
    gift_card_id: giftCardId,
    card_id: giftCard?.card_id != null ? String(giftCard.card_id) : undefined,
    card_type: cardType,
    product,
    amount,
    price,
    currency: String(giftCard?.currency ?? 'GHS'),
    base_price: parseAmount(giftCard?.base_price) || undefined,
    service_fee: parseAmount(giftCard?.service_fee) || undefined,
    status: String(guestCard?.status ?? ''),
    gift_card_status: giftCard?.status != null ? String(giftCard.status) : undefined,
    guest_name: guestCard?.guest_name != null ? String(guestCard.guest_name) : undefined,
    guest_email: guestCard?.guest_email != null ? String(guestCard.guest_email) : undefined,
    guest_phone: guestCard?.guest_phone != null ? String(guestCard.guest_phone) : undefined,
    created_at: String(guestCard?.created_at ?? ''),
    updated_at: guestCard?.updated_at != null ? String(guestCard.updated_at) : undefined,
  }
}

function mapLegacyGuestCardRow(row: Record<string, unknown>): GuestCreatedCard | null {
  const guestCardId = String(row.id ?? row.guest_card_id ?? '')
  if (!guestCardId && !row.product && !row.card_type) return null

  const cardType = String(row.card_type ?? '')
  const amount = parseAmount(row.amount ?? row.price)

  return {
    guest_card_id: guestCardId,
    gift_card_id: String(row.gift_card_id ?? row.id ?? ''),
    card_id: row.card_id != null ? String(row.card_id) : undefined,
    card_type: cardType,
    product: String(row.product ?? (cardType || 'Gift card')),
    amount,
    price: parseAmount(row.price ?? row.amount),
    currency: String(row.currency ?? 'GHS'),
    status: String(row.status ?? ''),
    created_at: String(row.created_at ?? row.issue_date ?? ''),
  }
}

/**
 * Unwrap GET /guest-cards list (axios may return envelope or inner data array).
 */
export function parseGuestCreatedCardsResponse(response: unknown): GuestCreatedCard[] {
  let items: unknown[] = []
  if (Array.isArray(response)) {
    items = response
  } else if (response && typeof response === 'object') {
    const data = (response as { data?: unknown }).data
    if (Array.isArray(data)) items = data
  }

  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      if (row.guest_card != null || row.gift_card != null) {
        return mapNestedGuestCardRow(row)
      }
      return mapLegacyGuestCardRow(row)
    })
    .filter((card): card is GuestCreatedCard => card != null)
}

export function formatGuestCardStatusLabel(status: string): string {
  if (!status) return ''
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}
