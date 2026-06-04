import type { GuestAddToCartPendingItem } from '@/stores/guestAddToCartModal'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { assertGuestCartAmountWithinLimit } from '@/features/website/utils/validateGuestLocalCart'

function hasCatalogCardId(cardId: GuestAddToCartPendingItem['card_id']): boolean {
  if (cardId == null || cardId === '') return false
  const id = String(cardId).trim()
  return id !== '' && id !== '0'
}

/**
 * Adds a guest modal pending item to the persisted local cart (no OTP).
 * Returns true when a line was added, false when the item only unlocks browsing (authOnly).
 */
export function addGuestPendingItemToLocalCart(item: GuestAddToCartPendingItem): boolean {
  if (item.price != null) {
    assertGuestCartAmountWithinLimit(item.price)
  }

  const store = useGuestLocalCartStore.getState()
  const type = item.type?.toLowerCase()

  if (
    type === 'dashgo' &&
    item.vendor_id?.trim() &&
    item.price != null &&
    Array.isArray(item.redemption_branches) &&
    item.redemption_branches.length > 0
  ) {
    store.addCustomDashGoLine({
      vendor_id: item.vendor_id.trim(),
      product: item.product?.trim() || 'DashGo Gift Card',
      description:
        item.description?.trim() ||
        `Custom DashGo card${item.vendor_name ? ` for ${item.vendor_name}` : ''}`,
      amount: item.price,
      currency: item.currency ?? 'GHS',
      redemption_branches: item.redemption_branches,
      assign_to_self: false,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      message: '',
    })
    return true
  }

  if (hasCatalogCardId(item.card_id) && item.price != null) {
    store.addCatalogCard({
      card_id: String(item.card_id),
      product: item.product ?? '',
      price: item.price,
      currency: item.currency ?? 'GHS',
      type: item.type,
    })
    return true
  }

  return false
}
