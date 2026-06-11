import { describe, expect, it } from 'vitest'
import {
  canCheckoutCart,
  canRemoveCartItem,
  canUpdateCartItemQuantity,
  isCartCheckoutPending,
  shouldArchiveCart,
  shouldHardDeleteCart,
} from '../cartLifecycle'

describe('cartLifecycle', () => {
  it('allows checkout on active and failed carts only', () => {
    expect(canCheckoutCart('active')).toBe(true)
    expect(canCheckoutCart('failed')).toBe(true)
    expect(canCheckoutCart('pending')).toBe(false)
    expect(canCheckoutCart('completed')).toBe(false)
    expect(isCartCheckoutPending('pending')).toBe(true)
    expect(isCartCheckoutPending('failed')).toBe(false)
  })

  it('allows quantity updates only on active carts', () => {
    expect(canUpdateCartItemQuantity('active')).toBe(true)
    expect(canUpdateCartItemQuantity('failed')).toBe(false)
    expect(canUpdateCartItemQuantity('completed')).toBe(false)
  })

  it('allows item removal on active and failed carts', () => {
    expect(canRemoveCartItem('active')).toBe(true)
    expect(canRemoveCartItem('failed')).toBe(true)
    expect(canRemoveCartItem('completed')).toBe(false)
  })

  it('routes hard delete vs archive by status', () => {
    expect(shouldHardDeleteCart('active')).toBe(true)
    expect(shouldHardDeleteCart('failed')).toBe(true)
    expect(shouldArchiveCart('completed')).toBe(true)
    expect(shouldArchiveCart('paid')).toBe(true)
    expect(shouldArchiveCart('active')).toBe(false)
    expect(shouldArchiveCart('pending')).toBe(false)
  })
})
