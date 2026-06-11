import { beforeEach, describe, expect, it, vi } from 'vitest'

const { deleteMethodMock, patchMethodMock, putMethodMock } = vi.hoisted(() => ({
  deleteMethodMock: vi.fn(),
  patchMethodMock: vi.fn(),
  putMethodMock: vi.fn(),
}))

vi.mock('@/services/requests', () => ({
  getList: vi.fn(),
  postMethod: vi.fn(),
  getMethod: vi.fn(),
  patchMethod: patchMethodMock,
  putMethod: putMethodMock,
  deleteMethod: deleteMethodMock,
}))

import { archiveCart, deleteCart, updateCartItem } from '../cards'

describe('member cart API endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deleteCart calls DELETE /carts/:id', async () => {
    deleteMethodMock.mockResolvedValueOnce({ data: { status: 'success' } })
    await deleteCart('cart-uuid-1')
    expect(deleteMethodMock).toHaveBeenCalledWith('/carts/cart-uuid-1')
  })

  it('archiveCart calls PATCH /carts/:id/archive', async () => {
    patchMethodMock.mockResolvedValueOnce({ data: { status: 'success' } })
    await archiveCart('cart-uuid-1')
    expect(patchMethodMock).toHaveBeenCalledWith('/carts/cart-uuid-1/archive')
  })

  it('updateCartItem uses PATCH /carts/items', async () => {
    patchMethodMock.mockResolvedValueOnce({ data: { status: 'success' } })
    await updateCartItem({ cart_item_id: 'item-1', quantity: 2 })
    expect(patchMethodMock).toHaveBeenCalledWith('/carts/items', {
      cart_item_id: 'item-1',
      quantity: 2,
    })
  })
})
