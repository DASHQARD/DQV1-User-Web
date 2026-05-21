import { describe, expect, it } from 'vitest'
import { parseGuestRedemptionsResponse } from '../guestRedemptionsHistory'

const sampleEnvelope = {
  status: 'success',
  statusCode: 200,
  message: 'Guest redemptions retrieved successfully',
  data: {
    data: [
      {
        redemption_id: '019e461b-5dd6-7957-8c5d-6be680f33d71',
        source: 'user',
        transaction_reference: 'RED-1779292659157-C7DD809E',
        redemption_date: '2026-05-20T15:57:39.155Z',
        redemption_method: 'in_store',
        amount: '100.00',
        status: 'success',
        card_type: 'DashGo',
        product: 'DashGo Gift Card',
        branch_name: 'Gold key',
      },
    ],
    limit: 50,
    after: null,
    hasMore: false,
  },
}

describe('parseGuestRedemptionsResponse', () => {
  it('unwraps nested data.data from API envelope', () => {
    const parsed = parseGuestRedemptionsResponse(sampleEnvelope)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0]?.redemption_id).toBe('019e461b-5dd6-7957-8c5d-6be680f33d71')
    expect(parsed.items[0]?.status).toBe('success')
    expect(parsed.pagination.limit).toBe(50)
    expect(parsed.pagination.hasMore).toBe(false)
  })

  it('reads items when paginated payload is already unwrapped', () => {
    const parsed = parseGuestRedemptionsResponse(sampleEnvelope.data)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0]?.branch_name).toBe('Gold key')
  })

  it('returns empty for nullish input', () => {
    expect(parseGuestRedemptionsResponse(null).items).toEqual([])
  })
})
