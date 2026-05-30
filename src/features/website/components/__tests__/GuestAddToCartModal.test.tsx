import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import GuestAddToCartModal from '../GuestAddToCartModal/GuestAddToCartModal'

vi.mock('@/stores', () => ({
  useGuestAddToCartModalStore: () => ({
    isOpen: true,
    pendingItem: { card_id: 1, product: 'Test', price: 100 },
    checkoutOtpPrefill: null,
    close: vi.fn(),
  }),
  useAuthStore: (fn: (s: any) => any) =>
    fn({
      authenticate: vi.fn(),
      getGuestCartId: () => null,
      setGuestCartId: vi.fn(),
    }),
}))

vi.mock('@/stores/cart', () => ({
  useCartStore: () => ({ openCart: vi.fn() }),
}))

vi.mock('@/hooks', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}))

vi.mock('@/features/auth/services', () => ({
  guestAuthOtpRequest: vi.fn().mockResolvedValue({}),
  guestAuthOtpVerify: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/features/website/services/cards', () => ({
  ensureGuestCartAndAddCard: vi.fn().mockResolvedValue({}),
}))

describe('GuestAddToCartModal', () => {
  it('renders when open with Sign in and Continue as guest options', () => {
    renderWithProviders(<GuestAddToCartModal />)
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continue as guest/i })).toBeInTheDocument()
  })
})
