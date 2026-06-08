import { describe, expect, it } from 'vitest'

import { findCartItemIdByCardId } from '../customGiftCardCartHelpers'

describe('findCartItemIdByCardId', () => {
  it('finds cart_item_id from nested cart items', () => {
    const cartItems = [
      {
        items: [
          { card_id: 10, cart_item_id: 'item-10' },
          { gift_card_id: 20, cart_item_id: 42 },
        ],
      },
    ]

    expect(findCartItemIdByCardId(cartItems, 20)).toBe(42)
  })

  it('returns null when no match exists', () => {
    expect(findCartItemIdByCardId([], 99)).toBeNull()
  })
})
