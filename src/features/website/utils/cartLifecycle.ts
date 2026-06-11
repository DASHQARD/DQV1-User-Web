import { archiveCart, deleteCart } from '@/features/website/services/cards'
import { getApiErrorMessage } from '@/utils/apiError'

export type CartStatus = string

export function normalizeCartStatus(status?: string | null): string {
  return (status ?? 'active').toLowerCase()
}

/** POST /payments/checkout and /payments/guest/checkout — active or failed (retry). */
export function canCheckoutCart(cartStatus?: string | null): boolean {
  const status = normalizeCartStatus(cartStatus)
  return status === 'active' || status === 'failed'
}

export function isCartCheckoutPending(cartStatus?: string | null): boolean {
  return normalizeCartStatus(cartStatus) === 'pending'
}

/** PATCH /carts/items — only active carts. */
export function canUpdateCartItemQuantity(cartStatus?: string | null): boolean {
  return normalizeCartStatus(cartStatus) === 'active'
}

/** DELETE /carts/items — active or failed carts. */
export function canRemoveCartItem(cartStatus?: string | null): boolean {
  const status = normalizeCartStatus(cartStatus)
  return status === 'active' || status === 'failed'
}

/** DELETE /carts/:id — active or failed carts. */
export function shouldHardDeleteCart(cartStatus?: string | null): boolean {
  return canRemoveCartItem(cartStatus)
}

/** PATCH /carts/:id/archive — non-active/non-pending carts (e.g. completed). */
export function shouldArchiveCart(cartStatus?: string | null): boolean {
  const status = normalizeCartStatus(cartStatus)
  return status !== 'active' && status !== 'pending' && status !== 'failed'
}

export const CHECKOUT_CART_ID_STORAGE_KEY = 'dashqard_checkout_cart_id'

export function persistCheckoutCartId(cartId: string | number | null | undefined): void {
  if (cartId == null || cartId === '') return
  try {
    sessionStorage.setItem(CHECKOUT_CART_ID_STORAGE_KEY, String(cartId))
  } catch {
    // ignore storage errors
  }
}

export function consumeCheckoutCartId(): string | null {
  try {
    const id = sessionStorage.getItem(CHECKOUT_CART_ID_STORAGE_KEY)
    if (id) sessionStorage.removeItem(CHECKOUT_CART_ID_STORAGE_KEY)
    return id
  } catch {
    return null
  }
}

/** Hard-delete active/failed carts; archive completed/paid carts. */
export async function removeOrArchiveCart(
  cart_id: string | number,
  cartStatus?: string | null,
): Promise<unknown> {
  if (shouldArchiveCart(cartStatus)) {
    return archiveCart(cart_id)
  }

  try {
    return await deleteCart(cart_id)
  } catch (error) {
    const message = getApiErrorMessage(error, '')
    if (
      message.includes('Only active or failed carts can be deleted') ||
      message.includes('cannot be deleted')
    ) {
      return archiveCart(cart_id)
    }
    throw error
  }
}

export function getCartItemUpdateErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, 'Failed to update cart item')
  if (message.includes('Cannot modify a cart that is not active')) {
    return 'This cart can no longer be changed. Remove the item or start a new order.'
  }
  return message
}

export function getCartItemRemoveErrorMessage(error: unknown): string {
  const message = getApiErrorMessage(error, 'Failed to remove item')
  if (message.includes('Only active or failed carts can be modified')) {
    return 'This cart can no longer be modified.'
  }
  return message
}
