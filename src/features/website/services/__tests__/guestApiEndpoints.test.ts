import { describe, expect, it, vi, beforeEach } from 'vitest'

const getListMock = vi.fn()
const getMethodMock = vi.fn()
const patchMethodMock = vi.fn()
const axiosDeleteMock = vi.fn()

vi.mock('@/services/requests', () => ({
  getList: (...args: unknown[]) => getListMock(...args),
  getMethod: (...args: unknown[]) => getMethodMock(...args),
  postMethod: vi.fn(),
  patchMethod: (...args: unknown[]) => patchMethodMock(...args),
  deleteMethod: vi.fn(),
}))

vi.mock('@/libs', () => ({
  axiosClient: {
    delete: (...args: unknown[]) => axiosDeleteMock(...args),
  },
}))

describe('guest API endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getListMock.mockResolvedValue({ data: [] })
    patchMethodMock.mockResolvedValue({ status: 'success', message: 'ok' })
    axiosDeleteMock.mockResolvedValue({})
  })

  it('getGuestCards calls GET /guest-cards with optional card_type', async () => {
    const { getGuestCards } = await import('../cards')
    await getGuestCards({ card_type: 'DashGo' })
    expect(getListMock).toHaveBeenCalledWith('/guest-cards', { card_type: 'DashGo' })
  })

  it('getGuestCardSingle calls GET /guest-cards/single with guest_card_id', async () => {
    const { getGuestCardSingle } = await import('../cards')
    await getGuestCardSingle({ guest_card_id: 'guest-card-uuid' })
    expect(getListMock).toHaveBeenCalledWith('/guest-cards/single', {
      guest_card_id: 'guest-card-uuid',
    })
  })

  it('getGuestCartRecipients calls GET /guest-carts/recipients with cart_item_id only', async () => {
    getListMock.mockResolvedValue({ data: [{ recipient_id: 1 }] })
    const { getGuestCartRecipients } = await import('../cards')
    const result = await getGuestCartRecipients({ cart_item_id: 'item-1' })
    expect(getListMock).toHaveBeenCalledWith('/guest-carts/recipients', {
      cart_item_id: 'item-1',
    })
    expect(result).toEqual([{ recipient_id: 1 }])
  })

  it('updateGuestRecipient calls PATCH /guest-carts/recipients without guest_phone', async () => {
    const { updateGuestRecipient } = await import('../cards')
    await updateGuestRecipient({
      recipient_id: 3,
      recipient_name: 'Jane',
    })
    expect(patchMethodMock).toHaveBeenCalledWith('/guest-carts/recipients', {
      recipient_id: 3,
      recipient_name: 'Jane',
    })
  })

  it('deleteGuestRecipient calls DELETE /guest-carts/recipients with recipient_id only', async () => {
    const { deleteGuestRecipient } = await import('../cards')
    await deleteGuestRecipient({ recipient_id: 5 })
    expect(axiosDeleteMock).toHaveBeenCalledWith('/guest-carts/recipients', {
      params: { recipient_id: 5 },
    })
  })
})
