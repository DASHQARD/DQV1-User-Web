import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
} from '@/utils/constants'
import { CHECKOUT_CART_ID_STORAGE_KEY } from '@/features/website/utils/cartLifecycle'
import { GUEST_BROWSING_ACK_KEY } from '@/features/website/utils/guestBrowsingSession'
import {
  clearGuestBrowserStorage,
  clearGuestCheckoutAfterPurchase,
} from '@/features/website/utils/clearGuestCheckoutStorage'

const clearContact = vi.fn()
const clearCart = vi.fn()

vi.mock('@/stores/guestLocalCart', () => ({
  useGuestLocalCartStore: {
    getState: () => ({ clearContact }),
  },
}))

vi.mock('@/stores/cart', () => ({
  useCartStore: {
    getState: () => ({ clearCart }),
  },
}))

describe('clearGuestCheckoutStorage', () => {
  beforeEach(() => {
    clearContact.mockClear()
    clearCart.mockClear()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('clears guest contact and checkout keys from localStorage and sessionStorage', () => {
    localStorage.setItem(GUEST_EMAIL_STORAGE_KEY, 'a@b.com')
    localStorage.setItem(GUEST_NAME_STORAGE_KEY, 'Ada')
    localStorage.setItem(GUEST_PHONE_STORAGE_KEY, '+233555')
    localStorage.setItem('dashqard-guest-local-cart', '[]')
    localStorage.setItem(GUEST_BROWSING_ACK_KEY, '1')
    sessionStorage.setItem(GUEST_PHONE_STORAGE_KEY, '+233555')
    sessionStorage.setItem(CHECKOUT_CART_ID_STORAGE_KEY, '42')

    clearGuestBrowserStorage()

    expect(localStorage.getItem(GUEST_EMAIL_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(GUEST_NAME_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(GUEST_PHONE_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem('dashqard-guest-local-cart')).toBeNull()
    expect(localStorage.getItem(GUEST_BROWSING_ACK_KEY)).toBeNull()
    expect(sessionStorage.getItem(GUEST_PHONE_STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(CHECKOUT_CART_ID_STORAGE_KEY)).toBeNull()
    expect(clearContact).toHaveBeenCalledTimes(1)
    expect(clearCart).not.toHaveBeenCalled()
  })

  it('also clears persisted cart UI state after guest purchase', () => {
    clearGuestCheckoutAfterPurchase()

    expect(clearContact).toHaveBeenCalledTimes(1)
    expect(clearCart).toHaveBeenCalledTimes(1)
  })
})
