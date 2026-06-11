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

vi.mock('@/features/website/services/guestSession', () => ({
  ensureGuestSession: vi.fn().mockResolvedValue('guest-token'),
}))

import { createCustomDashGoAndAddToCart } from '../cards'

describe('createCustomDashGoAndAddToCart', () => {
  const setGuestCartUuid = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses cart refs from POST /guest-cards/dash-go response (single call)', async () => {
    const { ensureGuestSession } = await import('@/features/website/services/guestSession')
    postMethodMock.mockResolvedValueOnce({
      data: {
        status: 'success',
        statusCode: 201,
        data: {
          guest_card: { id: 'guest-card-1', gift_card_id: 'card-uuid-1', guest_phone: null },
          gift_card: { id: 'card-uuid-1', card_id: 'G-GH-0001-01-000001' },
          cart: { cart_id: 'cart-uuid-1', cart_item_id: 'item-1', total_amount: '100.00' },
        },
      },
    })

    const result = await createCustomDashGoAndAddToCart({
      vendor_id: 'v1',
      vendorName: 'Serge',
      price: 100,
      redemption_branches: [{ branch_id: 'b1' }],
      isGuestAuth: true,
      setGuestCartUuid,
    })

    expect(ensureGuestSession).toHaveBeenCalled()
    expect(postMethodMock).toHaveBeenCalledTimes(1)
    expect(postMethodMock).toHaveBeenCalledWith(
      '/guest-cards/dash-go',
      expect.objectContaining({ vendor_id: 'v1', price: 100 }),
    )
    const dashGoBody = postMethodMock.mock.calls[0]?.[1]
    expect(dashGoBody).not.toHaveProperty('guest_phone')
    expect(setGuestCartUuid).toHaveBeenCalledWith('cart-uuid-1')
    expect(result).toMatchObject({
      cardId: 'card-uuid-1',
      cartId: 'cart-uuid-1',
      cartItemId: 'item-1',
      cardDisplayRef: 'G-GH-0001-01-000001',
    })
    expect(postMethodMock).not.toHaveBeenCalledWith('/guest-carts/add-card', expect.anything())
  })

  it('throws when dash-go response is missing cart refs', async () => {
    postMethodMock.mockResolvedValueOnce({
      data: {
        data: {
          gift_card: { id: 'card-uuid-1' },
        },
      },
    })

    await expect(
      createCustomDashGoAndAddToCart({
        vendor_id: 'v1',
        vendorName: 'Serge',
        price: 100,
        redemption_branches: [{ branch_id: 'b1' }],
        isGuestAuth: true,
        setGuestCartUuid,
      }),
    ).rejects.toThrow(/cart references are missing/)
  })

  it('uses carts/create-dashgo for members without a second add-to-cart call', async () => {
    postMethodMock.mockResolvedValueOnce({
      data: {
        data: {
          card: { id: 'card-uuid-1' },
          cart_id: 'cart-1',
        },
      },
    })

    await createCustomDashGoAndAddToCart({
      vendor_id: 'v1',
      vendorName: 'Serge',
      price: 50,
      redemption_branches: [],
      isGuestAuth: false,
      setGuestCartUuid,
    })

    expect(postMethodMock).toHaveBeenCalledTimes(1)
    expect(postMethodMock).toHaveBeenCalledWith(
      '/carts/create-dashgo',
      expect.objectContaining({ vendor_id: 'v1', price: 50 }),
    )
    expect(postMethodMock).not.toHaveBeenCalledWith('/guest-cards/dash-go', expect.anything())
    expect(postMethodMock).not.toHaveBeenCalledWith('/carts', expect.anything())
  })
})
