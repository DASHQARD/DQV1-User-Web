import { describe, expect, it } from 'vitest'
import {
  getAssignedCardDisplayAmount,
  isGiftAssignedCard,
  isSelfPurchasedAssignedCard,
  mapAssignedCardToPurchasedCard,
  parseGuestAssignedCardsResponse,
} from '../guestAssignedCards'

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

  it('treats source=user checkout rows as self-purchased', () => {
    const card = sampleEnvelope.data.cards[0]!
    expect(isSelfPurchasedAssignedCard(card)).toBe(true)
    expect(isGiftAssignedCard(card)).toBe(false)
  })

  it('maps assigned checkout cards into purchased card tiles', () => {
    const dashGo = {
      source: 'user',
      guest_recipient_id: '019eb0f2-d6af-7217-a4e3-781a5520aaca',
      gift_card_id: '019eb0f2-d187-7629-9f58-107b8aed59bd',
      card_type: 'DashGo',
      product: 'DashGo Gift Card',
      amount: 200,
      price: 100,
      balance: 1,
      currency: 'GHS',
      vendor_id: '019e8cb0-9405-74a1-ab7b-e3c13b423a04',
      guest_cart_id: '019eb0f2-d173-7e03-9f88-1b3125ecb04b',
      assigned_at: '2026-06-10T09:53:03.036Z',
      redemption_code: 'QY7FA2',
      redeemed: false,
    }

    const mapped = mapAssignedCardToPurchasedCard(dashGo)
    expect(mapped).toMatchObject({
      card_type: 'DashGo',
      product: 'DashGo Gift Card',
      amount: 1,
      status: 'paid',
      cart_status: 'paid',
    })
    expect(getAssignedCardDisplayAmount(dashGo)).toBe(1)
  })
})
