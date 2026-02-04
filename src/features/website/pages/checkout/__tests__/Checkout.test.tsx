import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Checkout from '../Checkout'

vi.mock('@/assets/svgs/Dashx_bg.svg', () => ({ default: '/dashx-bg.svg' }))
vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))
vi.mock('@/assets/images/dashpass_bg.png', () => ({ default: '/dashpass-bg.png' }))
vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo-bg.svg' }))

vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    cartItems: [],
    isLoading: false,
    updateCartItem: vi.fn(),
    isUpdating: false,
  }),
}))
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: { fullname: '', email: '', phonenumber: '' } }),
    }),
    usePersistedModalState: () => ({ openModal: vi.fn(), closeModal: vi.fn() }),
    useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
  }
})
vi.mock('../../hooks', () => ({
  usePayments: () => ({
    useCheckoutService: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }),
}))

describe('Checkout (website)', () => {
  it('shows empty state when cart has no pending items', () => {
    renderWithProviders(<Checkout />)
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(
      screen.getByText('Add items to your cart to proceed to checkout'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Browse Gift Cards/i })).toBeInTheDocument()
  })
})
