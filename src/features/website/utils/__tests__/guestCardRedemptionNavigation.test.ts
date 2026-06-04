import { describe, it, expect } from 'vitest'
import {
  buildRedemptionUrlFromGuestAssignedCard,
  buildRedemptionUrlFromGuestPurchasedCard,
  findRedemptionCardInList,
  isGuestAssignedCardRedeemNavigable,
  isGuestPurchasedCardRedeemNavigable,
} from '../guestCardRedemptionNavigation'

describe('guestCardRedemptionNavigation', () => {
  it('builds vendor_id redeem URL for purchased DashX with vendor', () => {
    const url = buildRedemptionUrlFromGuestPurchasedCard({
      guest_card_id: '1',
      gift_card_id: 'gf-99',
      card_type: 'dashx',
      product: 'Test',
      amount: 100,
      price: 100,
      currency: 'GHS',
      status: 'paid',
      vendor_id: 'vendor-1',
      created_at: '',
    })
    expect(url).toContain('/redeem?')
    expect(url).toContain('method=vendor_id')
    expect(url).toContain('card_type=dashx')
    expect(url).toContain('vendor_id=vendor-1')
    expect(url).toContain('card_id=gf-99')
  })

  it('builds MoMo redeem URL for DashPro purchased card', () => {
    const url = buildRedemptionUrlFromGuestPurchasedCard({
      guest_card_id: '1',
      gift_card_id: 'gf-1',
      card_type: 'dashpro',
      product: 'Pro',
      amount: 50,
      price: 50,
      currency: 'GHS',
      status: 'paid',
      created_at: '',
    })
    expect(url).toBe('/redeem?method=vendor_mobile_money&card_type=dashpro')
  })

  it('isGuestPurchasedCardRedeemNavigable requires paid status and vendor for DashX', () => {
    expect(
      isGuestPurchasedCardRedeemNavigable({
        guest_card_id: '1',
        gift_card_id: 'g1',
        card_type: 'dashx',
        product: 'X',
        amount: 1,
        price: 1,
        currency: 'GHS',
        status: 'pending',
        vendor_id: 'v1',
        created_at: '',
      }),
    ).toBe(false)
    expect(
      isGuestPurchasedCardRedeemNavigable({
        guest_card_id: '1',
        gift_card_id: 'g1',
        card_type: 'dashx',
        product: 'X',
        amount: 1,
        price: 1,
        currency: 'GHS',
        status: 'paid',
        vendor_id: 'v1',
        created_at: '',
      }),
    ).toBe(true)
  })

  it('buildRedemptionUrlFromGuestAssignedCard includes branch and card id', () => {
    const url = buildRedemptionUrlFromGuestAssignedCard({
      gift_card_id: 'gift-42',
      card_type: 'dashgo',
      vendor_id: 'v-2',
      branch_id: 'branch-9',
      amount: 200,
    })
    expect(url).toContain('vendor_id=v-2')
    expect(url).toContain('branch_id=branch-9')
    expect(url).toContain('card_id=gift-42')
  })

  it('findRedemptionCardInList matches card_id and branch scope', () => {
    const cards = [
      { card_id: 'a', branch_id: 'b1' },
      { card_id: 'b', branch_id: 'b2' },
    ]
    expect(findRedemptionCardInList(cards, 'a', { branchId: 'b1' })?.card_id).toBe('a')
    expect(findRedemptionCardInList(cards, 'a', { branchId: 'b2' })).toBeUndefined()
  })

  it('isGuestAssignedCardRedeemNavigable rejects redeemed cards', () => {
    expect(isGuestAssignedCardRedeemNavigable({ redeemed: true, card_type: 'dashx' })).toBe(
      false,
    )
  })
})
