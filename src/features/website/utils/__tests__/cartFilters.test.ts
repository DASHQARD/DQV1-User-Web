import { describe, expect, it } from 'vitest'
import { filterShoppingCarts, isShoppingCartVisible } from '../cartFilters'

describe('cartFilters', () => {
  it('hides paid, completed, and archived carts', () => {
    expect(isShoppingCartVisible({ cart_status: 'active' })).toBe(true)
    expect(isShoppingCartVisible({ cart_status: 'failed' })).toBe(true)
    expect(isShoppingCartVisible({ cart_status: 'pending' })).toBe(true)
    expect(isShoppingCartVisible({ cart_status: 'paid' })).toBe(false)
    expect(isShoppingCartVisible({ cart_status: 'completed' })).toBe(false)
    expect(
      isShoppingCartVisible({ cart_status: 'active', archived_at: '2026-06-08T14:00:00.000Z' }),
    ).toBe(false)
  })

  it('filterShoppingCarts keeps only visible carts', () => {
    const carts = [
      { cart_status: 'active', cart_id: 1 } as any,
      { cart_status: 'paid', cart_id: 2 } as any,
      { cart_status: 'completed', cart_id: 3 } as any,
    ]
    expect(filterShoppingCarts(carts).map((c) => c.cart_id)).toEqual([1])
  })
})
