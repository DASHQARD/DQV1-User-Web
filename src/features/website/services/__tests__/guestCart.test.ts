import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getListMock, postMethodMock } = vi.hoisted(() => ({
  getListMock: vi.fn(),
  postMethodMock: vi.fn(),
}))

vi.mock('@/services/requests', () => ({
  getList: getListMock,
  postMethod: postMethodMock,
  getMethod: vi.fn(),
  patchMethod: vi.fn(),
  deleteMethod: vi.fn(),
}))

import {
  ensureGuestCartAndAddCard,
  getGuestCart,
  isGuestCartNotFoundError,
  resolveGuestCartRef,
  resolveGuestCartUuid,
} from '../cards'

describe('guest cart helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isGuestCartNotFoundError detects 404 and message', () => {
    expect(isGuestCartNotFoundError({ status: 404, message: 'Cart not found' })).toBe(true)
    expect(isGuestCartNotFoundError({ status: 500, message: 'Server error' })).toBe(false)
  })

  it('getGuestCart returns null on 404 instead of throwing', async () => {
    getListMock.mockRejectedValueOnce({ status: 404, message: 'Cart not found' })
    await expect(getGuestCart()).resolves.toBeNull()
  })

  it('getGuestCart rethrows non-404 errors', async () => {
    getListMock.mockRejectedValueOnce({ status: 500, message: 'Server error' })
    await expect(getGuestCart()).rejects.toMatchObject({ status: 500 })
  })

  it('resolveGuestCartUuid reads string cart id as UUID', () => {
    expect(
      resolveGuestCartUuid({
        cart: {
          id: '019e4649-aaaa-bbbb-cccc-ddddeeeeffff',
          guest_phone: '+233551234567',
          guest_name: 'Test',
          guest_email: 't@example.com',
          status: 'pending',
          total_amount: '0',
          created_at: '',
          updated_at: '',
        },
        items: [],
      }),
    ).toBe('019e4649-aaaa-bbbb-cccc-ddddeeeeffff')
  })

  it('ensureGuestCartAndAddCard creates cart when GET returns 404', async () => {
    getListMock.mockRejectedValueOnce({ status: 404, message: 'Cart not found' })

    postMethodMock
      .mockResolvedValueOnce({
        data: {
          cart: {
            id: '019e4649-new-cart-uuid',
            guest_phone: '+233551234567',
            guest_name: 'Jane',
            guest_email: 'jane@example.com',
            status: 'pending',
            total_amount: '0',
            created_at: '',
            updated_at: '',
          },
        },
      })
      .mockResolvedValueOnce({
        data: { cart_id: '019e4649-new-cart-uuid' },
      })

    const setGuestCartId = vi.fn()
    const setGuestCartUuid = vi.fn()

    await ensureGuestCartAndAddCard({
      card_id: 'card-uuid-1',
      guest_name: 'Jane',
      guest_email: 'jane@example.com',
      getGuestCartId: () => null,
      getGuestCartUuid: () => null,
      setGuestCartId,
      setGuestCartUuid,
    })

    expect(postMethodMock).toHaveBeenCalledWith('/guest-carts', {
      guest_name: 'Jane',
      guest_email: 'jane@example.com',
    })
    expect(postMethodMock).toHaveBeenCalledWith(
      '/guest-carts/add-card',
      expect.objectContaining({
        card_id: 'card-uuid-1',
        cart_id: '019e4649-new-cart-uuid',
      }),
    )
    expect(setGuestCartUuid).toHaveBeenCalledWith('019e4649-new-cart-uuid')
  })

  it('resolveGuestCartRef prefers uuid over numeric id', () => {
    expect(
      resolveGuestCartRef({
        cart: {
          id: '019e4649-uuid',
          uuid: '019e4649-uuid',
          guest_phone: '',
          guest_name: '',
          guest_email: '',
          status: 'pending',
          total_amount: '0',
          created_at: '',
          updated_at: '',
        },
        items: [],
      }),
    ).toBe('019e4649-uuid')
  })
})
