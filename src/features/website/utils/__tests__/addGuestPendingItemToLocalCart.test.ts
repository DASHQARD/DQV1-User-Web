import { describe, expect, it } from 'vitest'
import { addGuestPendingItemToLocalCart } from '../addGuestPendingItemToLocalCart'

describe('addGuestPendingItemToLocalCart', () => {
  it('returns false — guest cart is server-backed', () => {
    expect(
      addGuestPendingItemToLocalCart({
        card_id: '42',
        product: 'Test',
        price: 50,
      }),
    ).toBe(false)
  })
})
