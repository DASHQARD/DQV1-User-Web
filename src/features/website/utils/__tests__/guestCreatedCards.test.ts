import { describe, expect, it } from 'vitest'
import {
  getGuestCreatedCardRowKey,
  parseGuestCreatedCardsResponse,
} from '../guestCreatedCards'

describe('parseGuestCreatedCardsResponse', () => {
  it('flattens nested guest_card and gift_card from API envelope', () => {
    const cards = parseGuestCreatedCardsResponse({
      status: 'success',
      data: [
        {
          guest_card: {
            id: '019e4a95-6d65-7df8-9156-9ffc0b3adbab',
            gift_card_id: '019e4a95-6d55-7360-947c-7cd534003269',
            guest_phone: '+233559617908',
            guest_name: 'Abeeku Djokoto',
            guest_email: 'djokotoabeeku619@gmail.com',
            card_type: 'DashGo',
            amount: '100.00',
            status: 'pending',
            created_at: '2026-05-21T12:49:27.343Z',
          },
          gift_card: {
            id: '019e4a95-6d55-7360-947c-7cd534003269',
            card_id: 'G-9688-01-01-000007',
            product: 'DashGo Gift Card',
            type: 'DashGo',
            price: '100.00',
            currency: 'GHS',
            base_price: '100.00',
            status: 'active',
          },
        },
      ],
    })

    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      guest_card_id: '019e4a95-6d65-7df8-9156-9ffc0b3adbab',
      gift_card_id: '019e4a95-6d55-7360-947c-7cd534003269',
      card_id: 'G-9688-01-01-000007',
      card_type: 'DashGo',
      product: 'DashGo Gift Card',
      amount: 100,
      price: 100,
      currency: 'GHS',
      status: 'pending',
      gift_card_status: 'active',
      guest_name: 'Abeeku Djokoto',
    })
  })

  it('parses a direct data array', () => {
    const cards = parseGuestCreatedCardsResponse([
      {
        guest_card: {
          id: 'g1',
          card_type: 'DashPro',
          amount: '10',
          status: 'pending',
          created_at: '2026-01-01',
        },
        gift_card: { product: 'DashPro', type: 'DashPro', price: '10', currency: 'GHS' },
      },
    ])
    expect(cards[0].product).toBe('DashPro')
    expect(cards[0].amount).toBe(10)
  })

  it('parses flat purchased guest card rows', () => {
    const cards = parseGuestCreatedCardsResponse({
      status: 'success',
      data: [
        {
          recipient_id: '019e78a2-5020-7291-b82b-56f24a000f3c',
          gift_card_id: '019e409a-6d06-7b22-b38c-0900e8381593',
          card_reference: 'X-2064-01-01-01-0001-000001',
          card_type: 'DashX',
          product: 'The Elevate Card',
          currency: 'GHS',
          amount: 22,
          price: 22,
          vendor_name: 'Surge Africa',
          expiry_date: '2026-05-31T00:00:00.000Z',
          cart_status: 'paid',
          purchased_at: '2026-05-30T11:26:03.795Z',
        },
      ],
    })

    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      guest_card_id: '019e78a2-5020-7291-b82b-56f24a000f3c',
      recipient_id: '019e78a2-5020-7291-b82b-56f24a000f3c',
      gift_card_id: '019e409a-6d06-7b22-b38c-0900e8381593',
      card_reference: 'X-2064-01-01-01-0001-000001',
      card_type: 'DashX',
      product: 'The Elevate Card',
      amount: 22,
      vendor_name: 'Surge Africa',
      status: 'paid',
    })
  })

  it('maps full purchased guest-cards API row', () => {
    const cards = parseGuestCreatedCardsResponse({
      status: 'success',
      data: [
        {
          recipient_id: '019e7968-6f91-797d-8fd3-6578b47a6e1e',
          gift_card_id: '019e6a99-8f7c-7aa6-9657-ad9a9ad4d48e',
          card_reference: 'X-1397-01-01-01-0001-000001',
          card_type: 'DashX',
          product: 'FlexiWorkGh Retail Rewards Card',
          currency: 'GHS',
          amount: 151.5,
          quantity: 1,
          vendor_name: 'FlexiWorkGh',
          recipient_name: 'Guest',
          recipient_phone: '+233559617908',
          recipient_email: null,
          redemption_code: '7CR5J5',
          cart_status: 'paid',
          purchased_at: '2026-05-30T15:02:27.979Z',
          guest_cart_item_id: '019e7966-b147-71ad-b526-785af81aa31b',
        },
      ],
    })

    expect(cards[0]).toMatchObject({
      recipient_id: '019e7968-6f91-797d-8fd3-6578b47a6e1e',
      gift_card_id: '019e6a99-8f7c-7aa6-9657-ad9a9ad4d48e',
      redemption_code: '7CR5J5',
      guest_phone: '+233559617908',
      guest_email: null,
      status: 'paid',
      quantity: 1,
    })
    expect(getGuestCreatedCardRowKey(cards[0])).toContain('019e7968-6f91-797d-8fd3-6578b47a6e1e')
  })

  it('sorts purchased cards by purchased_at descending', () => {
    const cards = parseGuestCreatedCardsResponse({
      data: [
        { recipient_id: 'a', gift_card_id: 'g1', card_type: 'DashPro', purchased_at: '2026-05-01' },
        { recipient_id: 'b', gift_card_id: 'g2', card_type: 'DashPro', purchased_at: '2026-05-30' },
      ],
    })
    expect(cards[0].recipient_id).toBe('b')
  })
})
