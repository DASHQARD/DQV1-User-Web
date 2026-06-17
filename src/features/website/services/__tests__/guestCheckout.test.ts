import { describe, it, expect, vi, beforeEach } from 'vitest'

const postMethod = vi.fn()

vi.mock('@/services/requests', () => ({
  postMethod: (...args: unknown[]) => postMethod(...args),
  getMethod: vi.fn(),
}))

describe('guestCheckout service', () => {
  beforeEach(() => {
    postMethod.mockReset()
    postMethod.mockResolvedValue({ status: 'success' })
  })

  it('posts to /payments/guest/checkout with guest_cart_id UUID', async () => {
    const { guestCheckout } = await import('../payment')
    const payload = {
      guest_cart_id: '0193b1c4-2c4f-7000-9000-000000000001',
      full_name: 'Ama Mensah',
      email: 'ama@example.com',
      phone_number: '0241234567',
    }
    await guestCheckout(payload)
    expect(postMethod).toHaveBeenCalledWith('/payments/guest/checkout', payload)
  })
})
