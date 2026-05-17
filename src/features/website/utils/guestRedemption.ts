import { getImageUrl } from '@/utils/cardDisplay'
import type {
  GuestCardsRedemptionData,
  GuestCardsRedemptionPayload,
  GuestCardsRedemptionResponse,
} from '@/types/redemptions'

export type GuestVendorCard = {
  card_id: string
  card_name: string
  card_type: string
  card_price: number
  currency: string
  status: string
  branch_id?: string
  branch_name?: string
  branch_location?: string
  vendor_id?: string
  vendor_name?: string
  recipient_id?: string
  cart_item_id?: string
  image_url?: string
  expiry_date?: string
  description?: string
}

/** Prefer issued gift card id over catalog product card_id for redemption APIs */
export function resolveRedemptionCardId(card: Record<string, unknown> | null | undefined): string {
  if (!card) return ''

  const giftCardId = card.gift_card_id ?? card.gift_card_uuid
  if (giftCardId != null && String(giftCardId).trim() !== '') {
    return String(giftCardId)
  }

  const catalogId = card.card_id ?? card.catalog_card_id
  const instanceId =
    card.id ?? card.issued_card_id ?? card.redemption_card_id ?? card.gift_card_instance_id

  if (instanceId != null && catalogId != null && String(instanceId) !== String(catalogId)) {
    return String(instanceId)
  }
  if (instanceId != null && String(instanceId).trim() !== '') {
    return String(instanceId)
  }
  if (catalogId != null && String(catalogId).trim() !== '') {
    return String(catalogId)
  }
  return ''
}

export function formatBranchLabel(branch: {
  branch_id?: string | number
  branch_name?: string | null
  name?: string | null
  branch_location?: string | null
}): string {
  const name = branch.branch_name ?? branch.name
  const location = branch.branch_location
  const id = branch.branch_id != null ? String(branch.branch_id) : ''

  if (name && location) return `${name} — ${location}`
  if (name) return name
  if (location) return location
  if (id) return `Branch ${id.slice(0, 8)}`
  return 'Branch'
}

export function mapGuestAssignedCardToVendorCard(
  card: any,
  forcedType: 'dashx' | 'dashpass',
  currency = 'GHS',
): GuestVendorCard {
  return {
    card_id: resolveRedemptionCardId(card),
    card_name: card.product || card.card_name || 'Unknown Card',
    card_type: forcedType,
    card_price: Number(card.price || card.amount || card.card_price || 0),
    currency: card.currency || currency,
    status: card.status || card.card_status || 'active',
    branch_id: card.branch_id ? String(card.branch_id) : undefined,
    branch_name: card.branch_name || card.branch?.name,
    branch_location: card.branch_location || card.branch?.location,
    vendor_id: card.vendor_id ? String(card.vendor_id) : undefined,
    vendor_name: card.vendor_name,
    recipient_id: card.guest_recipient_id
      ? String(card.guest_recipient_id)
      : card.recipient_id
        ? String(card.recipient_id)
        : undefined,
    cart_item_id: card.cart_item_id != null ? String(card.cart_item_id) : undefined,
    image_url: card.images?.[0]?.file_url ? getImageUrl(card.images[0].file_url) : undefined,
    expiry_date: card.expiry_date,
    description: card.description,
  }
}

export function filterGuestAssignedByType(cards: any[], type: 'dashx' | 'dashpass'): any[] {
  const needle = type === 'dashx' ? 'dashx' : 'dashpass'
  return cards.filter((card) => {
    const normalized = String(card.card_type || '').toLowerCase()
    return normalized.includes(needle)
  })
}

export function filterCardsByBranch<T extends { branch_id?: string }>(
  cards: T[],
  selectedBranchId: string | null,
): T[] {
  if (selectedBranchId == null) return cards
  return cards.filter((card) => String(card.branch_id ?? '') === String(selectedBranchId))
}

/** Pick a redeemable gift card id from guest recipient-amounts / assigned-cards payloads */
export function pickGuestRedemptionCardId(
  cards: unknown[],
  redeemAmount?: number,
): string {
  if (!Array.isArray(cards) || cards.length === 0) return ''

  const entries = cards
    .map((raw) => ({
      raw: raw as Record<string, unknown>,
      id: resolveRedemptionCardId(raw as Record<string, unknown>),
      amount: Number((raw as Record<string, unknown>).amount ?? 0),
    }))
    .filter((entry) => entry.id !== '')

  if (entries.length === 0) return ''

  const amountNum = Number(redeemAmount) || 0
  if (amountNum > 0) {
    const covering = entries.find((entry) => entry.amount >= amountNum)
    if (covering) return covering.id
  }

  const sorted = [...entries].sort((a, b) => b.amount - a.amount)
  return sorted[0]?.id ?? ''
}

/** Round to 2 decimal places (major currency units) */
export function roundRedemptionAmount(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** Positive amount with at most 2 decimal places */
export function isValidRedemptionAmountInput(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || parseFloat(trimmed) <= 0) return false
  return /^\d+(\.\d{1,2})?$/.test(trimmed)
}

/** Build type-discriminated POST /guest-redemptions/cards body */
export function buildGuestCardsRedemptionPayload(
  input:
    | { card_type: 'DashGo' | 'DashPro'; branch_id: string; amount: number }
    | { card_type: 'DashX' | 'DashPass'; branch_id: string; card_id: string },
): GuestCardsRedemptionPayload {
  const branch_id = input.branch_id.trim()
  if (input.card_type === 'DashGo' || input.card_type === 'DashPro') {
    return {
      card_type: input.card_type,
      branch_id,
      amount: roundRedemptionAmount(input.amount),
    }
  }
  if (input.card_type === 'DashX' || input.card_type === 'DashPass') {
    return {
      card_type: input.card_type,
      branch_id,
      card_id: input.card_id.trim(),
    }
  }
  throw new Error(`Unsupported card type: ${(input as { card_type: string }).card_type}`)
}

export function isGuestRedemptionSuccess(
  response: Pick<GuestCardsRedemptionResponse, 'status' | 'statusCode'> | null | undefined,
): boolean {
  if (!response) return false
  if (response.status === 'success') return true
  const code = response.statusCode
  return code === 200 || code === 201 || code === 202
}

export function extractGuestRedemptionSuccess(
  response: GuestCardsRedemptionResponse,
): GuestCardsRedemptionData {
  return response.data ?? {}
}
