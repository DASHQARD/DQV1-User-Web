import { describe, expect, it } from 'vitest'
import { parseGuestAssignedCardsResponse } from '../guestAssignedCards'

const sampleEnvelope = {
  status: 'success',
  statusCode: 200,
  message: 'All assigned cards retrieved successfully',
  data: {
    guest_phone: '+233559617908',
    currency: 'GHS',
    cards: [
      {
        source: 'user',
        guest_recipient_id: '019e40a0-8070-7f58-abd5-42b431653f79',
        amount: 1000,
        redemption_code: '4HEGD2',
        assigned_at: '2026-05-20T15:47:14.176Z',
        card_type: 'DashPro',
        product: 'DashPro',
        currency: 'GHS',
        balance: 1000,
      },
    ],
  },
}

describe('parseGuestAssignedCardsResponse', () => {
  it('unwraps nested data.cards from standard API envelope', () => {
    const parsed = parseGuestAssignedCardsResponse(sampleEnvelope)
    expect(parsed.guest_phone).toBe('+233559617908')
    expect(parsed.currency).toBe('GHS')
    expect(parsed.cards).toHaveLength(1)
    expect(parsed.cards[0]?.redemption_code).toBe('4HEGD2')
    expect(parsed.cards[0]?.balance).toBe(1000)
  })

  it('reads cards when payload is already unwrapped', () => {
    const parsed = parseGuestAssignedCardsResponse(sampleEnvelope.data)
    expect(parsed.cards).toHaveLength(1)
    expect(parsed.cards[0]?.card_type).toBe('DashPro')
  })

  it('returns empty list for nullish input', () => {
    expect(parseGuestAssignedCardsResponse(null).cards).toEqual([])
  })
})
