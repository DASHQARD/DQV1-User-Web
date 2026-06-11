import { describe, expect, it } from 'vitest'
import {
  assertGuestCartAmountWithinLimit,
  getGuestCartAmountLimitError,
  GuestCartAmountLimitError,
  validateGuestLocalCartForCheckout,
} from '../validateGuestLocalCart'
import type { LocalGuestCartLine } from '@/features/website/utils/guestLocalCartTypes'

describe('assertGuestCartAmountWithinLimit', () => {
  it('allows amounts at the guest per-card maximum', () => {
    expect(() => assertGuestCartAmountWithinLimit(1000)).not.toThrow()
    expect(getGuestCartAmountLimitError(1000)).toBeNull()
  })

  it('throws GuestCartAmountLimitError above the maximum', () => {
    expect(() => assertGuestCartAmountWithinLimit(1000.01)).toThrow(GuestCartAmountLimitError)
    expect(getGuestCartAmountLimitError(1500)).toMatch(/limited to GHS 1,000/)
  })
})

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
