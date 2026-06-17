import { resolveRecipientAmountCardImageUrl } from '@/features/website/utils/recipientAmountCardImages'
import { isAssignedCardRedeemable } from '@/utils/cardExpiry'
import { formatBranchLabel } from '@/utils/format'

export { formatBranchLabel }
import type {
  GuestCardsRedemptionData,
  GuestCardsRedemptionPayload,
  GuestCardsRedemptionResponse,
  GuestMomoProvider,
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
    image_url: resolveRecipientAmountCardImageUrl(card),
    expiry_date: card.expiry_date,
    description: card.description,
  }
}

/** Guest assigned-cards row is still redeemable (not redeemed, not expired). */
export function isGuestAssignedCardRedeemable(
  card:
    | {
        redeemed?: boolean
        status?: string | null
        card_status?: string | null
        expiry_date?: string | null
      }
    | null
    | undefined,
): boolean {
  if (!card) return false
  return isAssignedCardRedeemable(card)
}

export type GuestCardTypeUi = 'dashpro' | 'dashgo' | 'dashx' | 'dashpass'

/** Read total_balance from GET /guest-redemptions/recipient-amounts/* responses. */
export function parseGuestRecipientAmountTotalBalance(payload: unknown): number | null {
  if (payload == null || typeof payload !== 'object') return null
  const root = payload as Record<string, unknown>
  const data =
    root.data != null && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root
  const raw = data.total_balance ?? root.total_balance
  if (raw === undefined || raw === null || raw === '') return null
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw))
  return Number.isFinite(num) ? num : null
}

/** Card-type toggles for guest redeem (no GET /redemptions/redeemable-cards). */
export function buildGuestCardTypeAvailability(input: {
  assignedCards: Array<{
    card_type?: string
    redeemed?: boolean
    status?: string | null
    expiry_date?: string | null
  }>
  dashProBalance?: number | null
  dashGoBalance?: number | null
}): Partial<Record<GuestCardTypeUi, boolean>> {
  const hasAssignedType = (needle: string) =>
    input.assignedCards.some((card) => {
      if (!isGuestAssignedCardRedeemable(card)) return false
      return String(card.card_type ?? '')
        .toLowerCase()
        .includes(needle)
    })

  const proBalance = input.dashProBalance ?? 0
  const goBalance = input.dashGoBalance ?? 0

  return {
    dashpro: proBalance > 0 || hasAssignedType('dashpro'),
    dashgo: goBalance > 0 || hasAssignedType('dashgo'),
    dashx: hasAssignedType('dashx'),
    dashpass: hasAssignedType('dashpass'),
  }
}

export function filterGuestAssignedByType(cards: any[], type: 'dashx' | 'dashpass'): any[] {
  const needle = type === 'dashx' ? 'dashx' : 'dashpass'
  return cards.filter((card) => {
    const normalized = String(card.card_type || '').toLowerCase()
    return normalized.includes(needle) && isGuestAssignedCardRedeemable(card)
  })
}

/** Narrow guest assigned-cards by vendor and/or branch (vendor_id redemption flow) */
export function filterGuestAssignedByVendorAndBranch(
  cards: any[],
  options: { vendorId?: string | null; branchId?: string | null },
): any[] {
  let result = cards
  const vendorId = options.vendorId?.trim()
  if (vendorId) {
    result = result.filter((card) => String(card.vendor_id ?? '') === vendorId)
  }
  const branchId = options.branchId?.trim()
  if (branchId) {
    result = result.filter((card) => String(card.branch_id ?? '') === branchId)
  }
  return result
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
/** Coerce API/UI redemption amounts (number or decimal string) to a finite number. */
export function parseRedemptionAmount(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback
  const num = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(num) ? num : fallback
}

export function formatRedemptionAmount(value: unknown, fallback = 0): string {
  return parseRedemptionAmount(value, fallback).toFixed(2)
}

export function normalizeRedemptionSuccessData(
  data: GuestCardsRedemptionData | null | undefined,
): GuestCardsRedemptionData | null {
  if (!data) return null
  return {
    ...data,
    amount: data.amount != null ? parseRedemptionAmount(data.amount) : undefined,
  }
}

export function roundRedemptionAmount(amount: number): number {
  return Math.round(amount * 100) / 100
}

/** Positive amount with at most 2 decimal places */
export function isValidRedemptionAmountInput(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || parseFloat(trimmed) <= 0) return false
  return /^\d+(\.\d{1,2})?$/.test(trimmed)
}

function parseAvailableBalance(availableBalance: number | null): number | null {
  if (availableBalance === null) return null
  const numeric =
    typeof availableBalance === 'number'
      ? availableBalance
      : parseFloat(String(availableBalance))
  return Number.isFinite(numeric) ? numeric : null
}

/** True when a positive entered amount exceeds the available balance. */
export function exceedsAvailableBalance(
  amountInput: string,
  availableBalance: number | null,
): boolean {
  const balance = parseAvailableBalance(availableBalance)
  if (balance === null || balance <= 0) return false
  const trimmed = amountInput.trim()
  if (!trimmed) return false
  const parsed = parseFloat(trimmed)
  if (!Number.isFinite(parsed) || parsed <= 0) return false
  return roundRedemptionAmount(parsed) > balance
}

/** User-facing message when redemption amount exceeds balance; null when not applicable. */
export function getInsufficientBalanceMessage(
  amountInput: string,
  availableBalance: number | null,
  cardLabel = 'DashPro',
): string | null {
  const balance = parseAvailableBalance(availableBalance)
  if (balance === null || !exceedsAvailableBalance(amountInput, balance)) {
    return null
  }
  return `Insufficient ${cardLabel} balance. Available: GHS ${balance.toFixed(2)}`
}

/** Build type-discriminated POST /guest-redemptions/cards body */
export function buildGuestCardsRedemptionPayload(
  input:
    | {
        card_type: 'DashPro'
        amount: number
        vendor_phone_number: string
        provider: GuestMomoProvider
      }
    | { card_type: 'DashGo'; card_id: string; branch_id: string; amount: number }
    | { card_type: 'DashX' | 'DashPass'; branch_id: string; card_id: string },
): GuestCardsRedemptionPayload {
  if (input.card_type === 'DashPro') {
    return {
      card_type: 'DashPro',
      amount: roundRedemptionAmount(input.amount),
      vendor_phone_number: input.vendor_phone_number.trim(),
      provider: input.provider,
    }
  }
  const branch_id = input.branch_id.trim()
  if (input.card_type === 'DashGo') {
    return {
      card_type: 'DashGo',
      card_id: input.card_id.trim(),
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
  return normalizeRedemptionSuccessData(response.data ?? {}) ?? {}
}
