import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PaymentSuccess from '../paymentSuccess/PaymentSuccess'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useNavigate: () => vi.fn(),
  }
})

const mockUseAuthStore = vi.fn()

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) =>
    mockUseAuthStore(selector),
}))

vi.mock('@/features/website/hooks/useArchiveCheckoutCart', () => ({
  useArchiveCheckoutCart: vi.fn(),
}))

const mockUseClearGuestCheckoutAfterPurchase = vi.fn()

vi.mock('@/features/website/hooks/useClearGuestCheckoutAfterPurchase', () => ({
  useClearGuestCheckoutAfterPurchase: (...args: unknown[]) =>
    mockUseClearGuestCheckoutAfterPurchase(...args),
}))

describe('PaymentSuccess (website)', () => {
  beforeEach(() => {
    mockUseClearGuestCheckoutAfterPurchase.mockClear()
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        isAuthenticated: true,
        isGuestAuth: false,
        user: { user_type: 'user' },
      }),
    )
  })

  it('renders Payment Successful heading', () => {
    renderWithProviders(<PaymentSuccess />)
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument()
  })

  it('renders member dashboard actions', () => {
    renderWithProviders(<PaymentSuccess />)
    expect(mockUseClearGuestCheckoutAfterPurchase).toHaveBeenCalledWith(false)
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view orders/i })).toBeInTheDocument()
  })

  it('renders guest actions without dashboard for guest checkout', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        isAuthenticated: true,
        isGuestAuth: true,
        user: { user_type: 'guest' },
      }),
    )
    renderWithProviders(<PaymentSuccess />)
    expect(mockUseClearGuestCheckoutAfterPurchase).toHaveBeenCalledWith(true)
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redeem a gift card/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /go to dashboard/i })).not.toBeInTheDocument()
  })

  it('renders sign in when session is not authenticated', () => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({
        isAuthenticated: false,
        isGuestAuth: false,
        user: null,
      }),
    )
    renderWithProviders(<PaymentSuccess />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /go to dashboard/i })).not.toBeInTheDocument()
  })
})
