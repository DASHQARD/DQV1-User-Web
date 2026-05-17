import { describe, expect, it } from 'vitest'
import {
  buildGuestCardsRedemptionPayload,
  isGuestRedemptionSuccess,
  isValidRedemptionAmountInput,
  pickGuestRedemptionCardId,
  resolveRedemptionCardId,
  roundRedemptionAmount,
} from '../guestRedemption'

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

  it('buildGuestCardsRedemptionPayload omits amount for DashX', () => {
    expect(
      buildGuestCardsRedemptionPayload({
        card_type: 'DashX',
        branch_id: 'branch-1',
        card_id: 'card-1',
      }),
    ).toEqual({
      card_type: 'DashX',
      branch_id: 'branch-1',
      card_id: 'card-1',
    })
  })

  it('buildGuestCardsRedemptionPayload omits card_id for DashGo', () => {
    expect(
      buildGuestCardsRedemptionPayload({
        card_type: 'DashGo',
        branch_id: 'branch-1',
        amount: 25.5,
      }),
    ).toEqual({
      card_type: 'DashGo',
      branch_id: 'branch-1',
      amount: 25.5,
    })
  })

  it('isGuestRedemptionSuccess accepts 202', () => {
    expect(isGuestRedemptionSuccess({ status: 'success', statusCode: 202 })).toBe(true)
  })

  it('roundRedemptionAmount limits to 2 decimal places', () => {
    expect(roundRedemptionAmount(25.556)).toBe(25.56)
  })

  it('isValidRedemptionAmountInput rejects more than 2 decimal places', () => {
    expect(isValidRedemptionAmountInput('10.001')).toBe(false)
    expect(isValidRedemptionAmountInput('10.50')).toBe(true)
  })
})
