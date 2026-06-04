import { beforeEach, describe, expect, it } from 'vitest'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { addGuestPendingItemToLocalCart } from '../addGuestPendingItemToLocalCart'

describe('addGuestPendingItemToLocalCart', () => {
  beforeEach(() => {
    useGuestLocalCartStore.getState().clear()
  })

  it('adds catalog cards to the local cart', () => {
    const added = addGuestPendingItemToLocalCart({
      card_id: '42',
      product: 'Test Card',
      price: 100,
      type: 'dashx',
      currency: 'GHS',
    })
    expect(added).toBe(true)
    expect(useGuestLocalCartStore.getState().lines).toHaveLength(1)
    expect(useGuestLocalCartStore.getState().lines[0].card_id).toBe('42')
  })

  it('adds DashGo vendor lines when branch metadata is present', () => {
    const added = addGuestPendingItemToLocalCart({
      card_id: 0,
      product: 'DashGo Gift Card',
      price: 150,
      type: 'dashgo',
      vendor_id: 'v-1',
      vendor_name: 'Acme',
      redemption_branches: [{ branch_id: 'b-1' }],
    })
    expect(added).toBe(true)
    expect(useGuestLocalCartStore.getState().lines[0].lineKind).toBe('dashgo')
    expect(useGuestLocalCartStore.getState().lines[0].vendor_id).toBe('v-1')
  })

  it('returns false for authOnly without addable payload', () => {
    const added = addGuestPendingItemToLocalCart({
      card_id: 0,
      authOnly: true,
      type: 'dashpro',
    })
    expect(added).toBe(false)
    expect(useGuestLocalCartStore.getState().lines).toHaveLength(0)
  })

  it('throws when amount exceeds guest limit', () => {
    expect(() =>
      addGuestPendingItemToLocalCart({
        card_id: '1',
        product: 'Big',
        price: 1500,
        type: 'dashx',
      }),
    ).toThrow()
  })
})
