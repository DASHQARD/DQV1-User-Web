import { beforeEach, describe, expect, it, vi } from 'vitest'

const { postMethodMock } = vi.hoisted(() => ({
  postMethodMock: vi.fn(),
}))

vi.mock('@/services/requests', () => ({
  getList: vi.fn(),
  postMethod: postMethodMock,
  getMethod: vi.fn(),
  patchMethod: vi.fn(),
  deleteMethod: vi.fn(),
}))

import { createCustomDashGoAndAddToCart } from '../cards'

describe('createCustomDashGoAndAddToCart', () => {
  const setGuestCartId = vi.fn()
  const setGuestCartUuid = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips add-card when dash-go response already includes cart', async () => {
    postMethodMock.mockResolvedValueOnce({
      data: {
        status: 'success',
        data: {
          guest_card: { gift_card_id: 'card-uuid-1' },
          gift_card: { id: 'card-uuid-1' },
          cart: { cart_id: 'cart-uuid-1', cart_item_id: 'item-1' },
        },
      },
    })

    await createCustomDashGoAndAddToCart({
      vendor_id: 'v1',
      vendorName: 'Serge',
      price: 100,
      redemption_branches: [{ branch_id: 'b1' }],
      isGuestAuth: true,
      guestContact: {
        guest_phone: '+233551234567',
        guest_name: 'Jane',
        guest_email: 'jane@example.com',
      },
      getGuestCartId: () => null,
      getGuestCartUuid: () => null,
      setGuestCartId,
      setGuestCartUuid,
    })

    expect(postMethodMock).toHaveBeenCalledTimes(1)
    expect(postMethodMock).toHaveBeenCalledWith(
      '/guest-cards/dash-go',
      expect.objectContaining({ vendor_id: 'v1', guest_name: 'Jane' }),
    )
    expect(setGuestCartUuid).toHaveBeenCalledWith('cart-uuid-1')
    expect(postMethodMock).not.toHaveBeenCalledWith('/guest-carts/add-card', expect.anything())
  })

  it('uses guest-carts/add-card when dash-go response has no cart', async () => {
    postMethodMock
      .mockResolvedValueOnce({
        data: {
          data: {
            gift_card: { id: 'card-uuid-1' },
          },
        },
      })
      .mockResolvedValueOnce({
        data: { cart_id: 'cart-uuid-1' },
      })

    await createCustomDashGoAndAddToCart({
      vendor_id: 'v1',
      vendorName: 'Serge',
      price: 100,
      redemption_branches: [{ branch_id: 'b1' }],
      isGuestAuth: true,
      guestContact: {
        guest_phone: '+233551234567',
        guest_name: 'Jane',
        guest_email: 'jane@example.com',
      },
      getGuestCartId: () => null,
      getGuestCartUuid: () => null,
      setGuestCartId,
      setGuestCartUuid,
    })

    expect(postMethodMock).toHaveBeenCalledWith(
      '/guest-cards/dash-go',
      expect.objectContaining({ vendor_id: 'v1', guest_name: 'Jane', guest_email: 'jane@example.com' }),
    )
    const dashGoBody = postMethodMock.mock.calls.find((c) => c[0] === '/guest-cards/dash-go')?.[1]
    expect(dashGoBody).not.toHaveProperty('guest_phone')
    expect(postMethodMock).toHaveBeenCalledWith(
      '/guest-carts/add-card',
      expect.objectContaining({ card_id: 'card-uuid-1' }),
    )
    expect(postMethodMock).not.toHaveBeenCalledWith('/carts/create-dashgo', expect.anything())
  })

  it('uses carts/create-dashgo for members', async () => {
    postMethodMock.mockResolvedValueOnce({ data: { id: 99 } })

    await createCustomDashGoAndAddToCart({
      vendor_id: 'v1',
      vendorName: 'Serge',
      price: 50,
      redemption_branches: [],
      isGuestAuth: false,
      getGuestCartId: () => null,
      setGuestCartId,
      setGuestCartUuid,
    })

    expect(postMethodMock).toHaveBeenCalledWith(
      '/carts/create-dashgo',
      expect.objectContaining({ vendor_id: 'v1', price: 50 }),
    )
    expect(postMethodMock).not.toHaveBeenCalledWith('/guest-cards/dash-go', expect.anything())
  })
})
