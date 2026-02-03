import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CartPopoverContent } from '../CartModal'

const mockCloseCart = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/stores/cart', () => ({
  useCartStore: () => ({
    closeCart: mockCloseCart,
  }),
}))

vi.mock('@/features/website/hooks/useCart', () => ({
  useCart: () => ({
    cartItems: [],
    isLoading: false,
    deleteCartItemAsync: vi.fn(),
    updateCartItem: vi.fn(),
    isUpdating: false,
  }),
}))

describe('CartModal (CartPopoverContent)', () => {
  beforeEach(() => {
    mockCloseCart.mockClear()
    mockNavigate.mockClear()
  })

  it('renders subtotal section', () => {
    renderWithProviders(<CartPopoverContent />)
    expect(screen.getByText(/Subtotal:/)).toBeInTheDocument()
  })

  it('renders empty state when cart has no items', () => {
    renderWithProviders(<CartPopoverContent />)
    expect(screen.getByText('Your bag is empty')).toBeInTheDocument()
    expect(screen.getByText('Add items to get started')).toBeInTheDocument()
  })
})
