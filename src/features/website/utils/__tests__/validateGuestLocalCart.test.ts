import { describe, expect, it } from 'vitest'
import { validateGuestLocalCartForCheckout } from '../validateGuestLocalCart'
import type { LocalGuestCartLine } from '@/stores/guestLocalCart'

describe('validateGuestLocalCartForCheckout', () => {
  it('flags DashPro below custom card minimum', () => {
    const lines: LocalGuestCartLine[] = [
      {
        lineId: 'l1',
        lineKind: 'dashpro',
        card_id: 'dashpro',
        product: 'DashPro',
        price: 10,
        currency: 'GHS',
        quantity: 1,
        recipientDrafts: [],
      },
    ]
    const result = validateGuestLocalCartForCheckout(lines)
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.product).toBe('DashPro')
    expect(result.issues[0]?.message).toMatch(/Minimum amount is GHS 50/)
  })

  it('flags amount above guest checkout max', () => {
    const lines: LocalGuestCartLine[] = [
      {
        lineId: 'l1',
        lineKind: 'dashpro',
        card_id: 'dashpro',
        product: 'DashPro',
        price: 1500,
        currency: 'GHS',
        quantity: 1,
        recipientDrafts: [],
      },
    ]
    const result = validateGuestLocalCartForCheckout(lines)
    expect(result.valid).toBe(false)
    expect(result.issues[0]?.message).toMatch(/limited to GHS 1,000/)
  })

  it('passes valid DashGo line', () => {
    const lines: LocalGuestCartLine[] = [
      {
        lineId: 'l1',
        lineKind: 'dashgo',
        card_id: 'go',
        product: 'Vendor Card',
        price: 50,
        currency: 'GHS',
        quantity: 1,
        vendor_id: 'v1',
        redemption_branches: [{ branch_id: 'b1' }],
        recipientDrafts: [],
      },
    ]
    expect(validateGuestLocalCartForCheckout(lines).valid).toBe(true)
  })
})
