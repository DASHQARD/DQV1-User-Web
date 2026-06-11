import { describe, it, expect } from 'vitest'
import {
  mergeGuestServerCartsWithLocalLines,
  flattenServerCartItems,
} from '../guestLocalCartDisplay'
import type { LocalGuestCartLine } from '@/features/website/utils/guestLocalCartTypes'

describe('mergeGuestServerCartsWithLocalLines', () => {
  it('keeps server cart items when appending local DashPro/DashGo lines', () => {
    const serverCarts = [
      {
        cart_id: 1,
        cart_status: 'active',
        total_amount: '473',
        items: [
          {
            cart_item_id: 'server-1',
            card_id: 'card-a',
            product: 'Amazon Gift Card',
            type: 'dashx',
            total_quantity: 1,
            total_amount: '55',
            images: [{ file_url: 'amazon.png' }],
          },
          {
            cart_item_id: 'server-2',
            card_id: 'card-b',
            product: 'Drake Ultimate Fan Experience',
            type: 'dashx',
            total_quantity: 2,
            total_amount: '418',
            images: [{ file_url: 'drake.png' }],
          },
        ],
      },
    ] as any

    const localLines: LocalGuestCartLine[] = [
      {
        lineId: 'local-dashpro-1',
        lineKind: 'dashpro',
        card_id: 'pending-local-dashpro-1',
        product: 'DashPro',
        price: 50,
        currency: 'GHS',
        type: 'dashpro',
        quantity: 1,
        recipientDrafts: [],
        country_code: 'GH',
      },
    ]

    const merged = mergeGuestServerCartsWithLocalLines(serverCarts, localLines)
    const items = Array.isArray(merged[0].items) ? merged[0].items : [merged[0].items]

    expect(items).toHaveLength(3)
    expect(items[0].product).toBe('Amazon Gift Card')
    expect(items[1].product).toBe('Drake Ultimate Fan Experience')
    expect(items[2].product).toBe('DashPro')
    expect(merged[0].total_amount).toBe('523')
  })

  it('flattens merged server items for per-unit bag display', () => {
    const flattened = flattenServerCartItems([
      {
        cart_id: 1,
        cart_status: 'active',
        total_amount: '418',
        items: {
          cart_item_id: 'server-2',
          card_id: 'card-b',
          product: 'Drake Ultimate Fan Experience',
          type: 'dashx',
          total_quantity: 2,
          total_amount: '418',
          images: [],
        },
      },
    ] as any)

    expect(flattened).toHaveLength(2)
    expect(flattened[0].quantity_index).toBe(0)
    expect(flattened[1].quantity_index).toBe(1)
  })
})
