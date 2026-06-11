import type { CartListResponse } from '@/types/responses'

/** Carts that should appear in bag, checkout, and cart popover (excludes paid/completed/archived). */
export function isShoppingCartVisible(
  cart: Pick<CartListResponse, 'cart_status'> & { archived_at?: string | null },
): boolean {
  if (cart.archived_at) return false
  const status = cart.cart_status?.toLowerCase() ?? ''
  return status !== 'paid' && status !== 'completed'
}

export function filterShoppingCarts(carts: CartListResponse[]): CartListResponse[] {
  if (!Array.isArray(carts)) return []
  return carts.filter(isShoppingCartVisible)
}
