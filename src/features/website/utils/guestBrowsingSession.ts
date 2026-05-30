import { GUEST_PHONE_STORAGE_KEY, getGuestContactSessionItem } from '@/utils/constants'

/** User chose guest checkout / browsing (local cart or continue-as-guest) before phone OTP. */
export const GUEST_BROWSING_ACK_KEY = 'dashqard-guest-browsing-ack'

export function setGuestBrowsingAck(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(GUEST_BROWSING_ACK_KEY, '1')
  }
}

export function clearGuestBrowsingAck(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(GUEST_BROWSING_ACK_KEY)
  }
}

export function hasGuestBrowsingAck(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(GUEST_BROWSING_ACK_KEY) === '1'
}

/** Anonymous user already shopping or verifying as guest (no member / guest JWT yet). */
export function hasAnonymousGuestBrowsingSession(localCartHasItems: boolean): boolean {
  if (localCartHasItems) return true
  if (hasGuestBrowsingAck()) return true
  return Boolean(getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY)?.trim())
}
