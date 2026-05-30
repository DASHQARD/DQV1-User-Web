import { describe, expect, it } from 'vitest'
import { parseGuestCreatedCardsResponse } from '../guestCreatedCards'

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
      gift_card_id: '019e409a-6d06-7b22-b38c-0900e8381593',
      card_type: 'DashX',
      product: 'The Elevate Card',
      amount: 22,
      vendor_name: 'Surge Africa',
      status: 'paid',
    })
  })
})
