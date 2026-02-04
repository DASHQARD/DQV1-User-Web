import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import OrdersPage from '../OrdersPage'

vi.mock('@/services', () => ({
  getPaymentInfo: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/assets/images', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/assets/images')>()
  return {
    ...actual,
    EmptyStateImage: '/empty.png',
  }
})

describe('OrdersPage (website)', () => {
  it('renders My Orders heading', async () => {
    renderWithProviders(<OrdersPage />)
    expect(await screen.findByText('My Orders')).toBeInTheDocument()
  })

  it('renders empty state when no orders', async () => {
    renderWithProviders(<OrdersPage />)
    expect(await screen.findByText(/No orders found/i)).toBeInTheDocument()
  })
})
