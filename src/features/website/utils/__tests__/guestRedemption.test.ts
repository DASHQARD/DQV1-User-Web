import { describe, expect, it } from 'vitest'
import { pickGuestRedemptionCardId, resolveRedemptionCardId } from '../guestRedemption'

describe('guestRedemption', () => {
  it('resolveRedemptionCardId prefers gift_card_id from guest amount APIs', () => {
    expect(
      resolveRedemptionCardId({
        gift_card_id: '019e3109-b067-7f08-b13b-3a4a23b9046a',
        amount: 90,
      }),
    ).toBe('019e3109-b067-7f08-b13b-3a4a23b9046a')
  })

  it('pickGuestRedemptionCardId selects a card with sufficient balance', () => {
    const id = pickGuestRedemptionCardId(
      [
        { gift_card_id: 'small', amount: 90 },
        { gift_card_id: 'large', amount: 1000 },
      ],
      500,
    )
    expect(id).toBe('large')
  })
})
