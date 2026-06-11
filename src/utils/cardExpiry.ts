/**
 * Gift card expiry helpers (frontend UX; backend remains authoritative).
 * Expiry dates are inclusive through the end of the UTC calendar day.
 */

export type CardExpiryFields = {
  status?: string | null
  card_status?: string | null
  expiry_date?: string | null
}

/** End of the expiry calendar day in UTC (ms), or null if missing/invalid. */
export function getCardExpiryEndTimestamp(expiryDate?: string | null): number | null {
  if (!expiryDate?.trim()) return null
  const parsed = new Date(expiryDate)
  if (Number.isNaN(parsed.getTime())) return null
  return Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
    23,
    59,
    59,
    999,
  )
}

export function isCardExpired(expiryDate?: string | null, now: number = Date.now()): boolean {
  const end = getCardExpiryEndTimestamp(expiryDate)
  if (end === null) return false
  return now > end
}

export function isCardStatusExpired(status?: string | null): boolean {
  const normalized = status?.trim().toLowerCase()
  return normalized === 'expired'
}

/** UI/API status: marks expired when date passed even if API still says active. */
export function resolveCardDisplayStatus(
  status?: string | null,
  expiryDate?: string | null,
): string {
  if (isCardStatusExpired(status)) return 'expired'
  if (isCardExpired(expiryDate)) return 'expired'
  const trimmed = status?.trim()
  return trimmed || 'active'
}

/** Catalog cards shown for browse / purchase. */
export function isCatalogCardPurchasable(card: CardExpiryFields): boolean {
  const status = card.status ?? card.card_status
  if (isCardStatusExpired(status)) return false
  if (isCardExpired(card.expiry_date)) return false
  const normalized = status?.trim().toLowerCase()
  if (normalized && normalized !== 'active') return false
  return true
}

export type MyGiftCardTabFields = CardExpiryFields & {
  is_activated?: boolean
  balance?: number
  amount?: number
  redeemed?: boolean
  /** Count cards (DashX / DashPass) have no monetary balance on metrics/details. */
  showBalance?: boolean
}

/** User My Cards tabs: active = redeemable now; inactive = expired, used, or deactivated. */
export function isMyGiftCardActive(card: MyGiftCardTabFields): boolean {
  if (card.is_activated === false) return false
  if (card.redeemed === true) return false
  if (!isAssignedCardRedeemable(card)) return false
  if (card.showBalance === false) return true
  const balance = card.balance ?? card.amount
  if (balance != null && Number(balance) <= 0) return false
  return true
}

/** Recipient / assigned cards eligible for redemption selection. */
export function isAssignedCardRedeemable(
  card: CardExpiryFields & { redeemed?: boolean },
): boolean {
  if (card.redeemed === true) return false
  const status = card.status ?? card.card_status
  if (isCardStatusExpired(status)) return false
  if (isCardExpired(card.expiry_date)) return false
  const normalized = status?.trim().toLowerCase()
  if (normalized && normalized !== 'active') return false
  return true
}

export const CARD_EXPIRED_MESSAGE =
  'This gift card has expired and can no longer be purchased or redeemed.'

/** Progress fill for catalog / guest card tiles (not time-based). */
export function getCardStatusBarWidth(displayStatus: string): number {
  const normalized = displayStatus.trim().toLowerCase()
  if (normalized === 'active') return 80
  if (normalized === 'expired') return 100
  return 40
}

/** Display status for guest purchased rows where API `cart_status` is `paid`. */
export function resolvePurchasedGuestCardDisplayStatus(
  cartStatus?: string | null,
  expiryDate?: string | null,
): string {
  const normalized = cartStatus?.trim().toLowerCase()
  if (normalized === 'paid') {
    return isCardExpired(expiryDate) ? 'expired' : 'active'
  }
  return resolveCardDisplayStatus(cartStatus, expiryDate)
}

/** Progress display status for shared guest gift card tiles. */
export function resolveGuestGiftCardTileDisplayStatus(
  statusLabel?: string | null,
  expiryDate?: string | null,
): string {
  const normalized = statusLabel?.trim().toLowerCase()
  if (normalized === 'paid') {
    return resolvePurchasedGuestCardDisplayStatus(statusLabel, expiryDate)
  }
  if (normalized === 'expired' || normalized === 'not redeemable') {
    return 'expired'
  }
  if (!statusLabel?.trim()) {
    return isCardExpired(expiryDate) ? 'expired' : 'active'
  }
  return resolveCardDisplayStatus(statusLabel, expiryDate)
}
