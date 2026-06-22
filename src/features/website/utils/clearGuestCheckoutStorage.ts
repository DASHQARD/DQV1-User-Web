import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
} from '@/utils/constants'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { useCartStore } from '@/stores/cart'
import { clearGuestBrowsingAck } from '@/features/website/utils/guestBrowsingSession'
import { CHECKOUT_CART_ID_STORAGE_KEY } from '@/features/website/utils/cartLifecycle'

const GUEST_LOCAL_CART_STORAGE_KEY = 'dashqard-guest-local-cart'

/** Remove guest contact and checkout session keys from browser storage. */
export function clearGuestBrowserStorage(): void {
  clearGuestBrowsingAck()
  useGuestLocalCartStore.getState().clearContact()

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(GUEST_EMAIL_STORAGE_KEY)
    localStorage.removeItem(GUEST_NAME_STORAGE_KEY)
    localStorage.removeItem(GUEST_PHONE_STORAGE_KEY)
    localStorage.removeItem(GUEST_LOCAL_CART_STORAGE_KEY)
  }

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(GUEST_EMAIL_STORAGE_KEY)
    sessionStorage.removeItem(GUEST_NAME_STORAGE_KEY)
    sessionStorage.removeItem(GUEST_PHONE_STORAGE_KEY)
    sessionStorage.removeItem(CHECKOUT_CART_ID_STORAGE_KEY)
  }
}

/** Guest purchase success — also clear any persisted cart UI state. */
export function clearGuestCheckoutAfterPurchase(): void {
  clearGuestBrowserStorage()
  useCartStore.getState().clearCart()
}
