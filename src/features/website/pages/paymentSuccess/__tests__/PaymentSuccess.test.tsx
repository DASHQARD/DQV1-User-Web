import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PaymentSuccess from '../PaymentSuccess'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ user: { user_type: 'user' } }),
}))

describe('PaymentSuccess (website)', () => {
  it('renders Payment Successful heading', () => {
    renderWithProviders(<PaymentSuccess />)
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
  })

  it('renders success icon or message', () => {
    renderWithProviders(<PaymentSuccess />)
    expect(
      screen.getByText('Payment Successful!') || document.body.textContent?.includes('Success'),
    ).toBeTruthy()
  })
})
