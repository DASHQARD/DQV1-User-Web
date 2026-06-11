import { describe, expect, it } from 'vitest'
import { localCartHasCustomGuestCards } from '../guestLocalCartOtp'
import type { LocalGuestCartLine } from '@/features/website/utils/guestLocalCartTypes'

describe('localCartHasCustomGuestCards', () => {
  it('returns true when cart has dashpro or dashgo lines', () => {
    expect(
      localCartHasCustomGuestCards([
        {
          lineId: '1',
          lineKind: 'dashpro',
          card_id: '',
          product: 'DashPro',
          currency: 'GHS',
          price: 10,
          quantity: 1,
          recipientDrafts: [],
        },
      ] satisfies LocalGuestCartLine[]),
    ).toBe(true)
    expect(
      localCartHasCustomGuestCards([
        {
          lineId: '2',
          lineKind: 'dashgo',
          card_id: '',
          price: 10,
          quantity: 1,
          product: 'DashGo',
          currency: 'GHS',
          vendor_id: 'v1',
          redemption_branches: [{ branch_id: 'b1' }],
          recipientDrafts: [],
        },
      ] satisfies LocalGuestCartLine[]),
    ).toBe(true)
  })

  it('returns false for catalog-only lines', () => {
    expect(
      localCartHasCustomGuestCards([
        {
          lineId: '3',
          lineKind: 'catalog',
          card_id: 'card-1',
          price: 10,
          quantity: 1,
          product: 'DashPass',
          currency: 'GHS',
          recipientDrafts: [],
        },
      ] satisfies LocalGuestCartLine[]),
    ).toBe(false)
  })
})
