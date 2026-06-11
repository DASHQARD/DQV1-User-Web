import type { GuestAddToCartPendingItem } from '@/stores/guestAddToCartModal'

/**
 * @deprecated Guest DashPro/DashGo and catalog cards use the server cart directly.
 * Kept for API compatibility — always returns false.
 */
export function addGuestPendingItemToLocalCart(_item: GuestAddToCartPendingItem): boolean {
  return false
}
