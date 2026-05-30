import { describe, expect, it } from 'vitest'
import {
  buildGuestCardsRedemptionPayload,
  filterGuestAssignedByType,
  filterGuestAssignedByVendorAndBranch,
  isGuestAssignedCardRedeemable,
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

  it('buildGuestCardsRedemptionPayload includes card_id for DashGo', () => {
    expect(
      buildGuestCardsRedemptionPayload({
        card_type: 'DashGo',
        branch_id: 'branch-1',
        amount: 25.5,
        card_id: '019e7875-c849-71f2-9f5e-ab4cee3fbb55',
      }),
    ).toEqual({
      card_type: 'DashGo',
      branch_id: 'branch-1',
      amount: 25.5,
      card_id: '019e7875-c849-71f2-9f5e-ab4cee3fbb55',
    })
  })

  it('buildGuestCardsRedemptionPayload omits card_id for DashPro', () => {
    expect(
      buildGuestCardsRedemptionPayload({
        card_type: 'DashPro',
        branch_id: 'branch-1',
        amount: 100,
      }),
    ).toEqual({
      card_type: 'DashPro',
      branch_id: 'branch-1',
      amount: 100,
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

  it('isGuestAssignedCardRedeemable excludes redeemed rows', () => {
    expect(isGuestAssignedCardRedeemable({ redeemed: false })).toBe(true)
    expect(isGuestAssignedCardRedeemable({ redeemed: true })).toBe(false)
  })

  it('filterGuestAssignedByType omits redeemed DashPass cards', () => {
    const cards = filterGuestAssignedByType(
      [
        { card_type: 'DashPass', redeemed: false, gift_card_id: 'a' },
        { card_type: 'DashPass', redeemed: true, gift_card_id: 'b' },
      ],
      'dashpass',
    )
    expect(cards).toHaveLength(1)
    expect(cards[0].gift_card_id).toBe('a')
  })

  it('filterGuestAssignedByVendorAndBranch scopes by vendor and branch', () => {
    const cards = [
      { vendor_id: 'v1', branch_id: 'b1' },
      { vendor_id: 'v1', branch_id: 'b2' },
      { vendor_id: 'v2', branch_id: 'b1' },
    ]
    expect(filterGuestAssignedByVendorAndBranch(cards, { vendorId: 'v1', branchId: 'b1' })).toEqual([
      { vendor_id: 'v1', branch_id: 'b1' },
    ])
  })
})
