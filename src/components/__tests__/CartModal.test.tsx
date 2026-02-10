import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CartPopoverContent } from '../CartModal'
import { useCartModal } from '@/features/website/hooks/useCartModal'

const mockCloseCart = vi.fn()
const mockNavigate = vi.fn()
const mockHandleCheckout = vi.fn()
const mockUpdateCartItem = vi.fn()
const mockHandleRemoveItem = vi.fn()

const defaultCartModalReturn = {
  closeCart: mockCloseCart,
  navigate: mockNavigate,
  activeCartItems: [],
  isLoading: false,
  totalItems: 0,
  subtotal: 0,
  updateCartItem: mockUpdateCartItem,
  isUpdating: false,
  deletingItemId: null,
  handleCheckout: mockHandleCheckout,
  handleRemoveItem: mockHandleRemoveItem,
  getCardBackground: () => '/bg.png',
  getImageUrl: (url: string) => url || '',
  getCardTypeName: () => 'DashX',
}

const mockCartItem = {
  cart_item_id: 1,
  cart_id: 1,
  total_amount: '100',
  total_quantity: 1,
  type: 'dashx',
  items: [{ product: 'Test Card', total_amount: '100', total_quantity: 1, images: [], cart_item_id: 1 }],
  cart_status: 'active',
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/stores/cart', () => ({
  useCartStore: () => ({ closeCart: mockCloseCart }),
}))

vi.mock('@/features/website/hooks/useCartModal', () => ({
  useCartModal: vi.fn(),
}))

describe('CartModal (CartPopoverContent)', () => {
  beforeEach(() => {
    vi.mocked(useCartModal).mockReturnValue(defaultCartModalReturn as any)
    mockCloseCart.mockClear()
    mockNavigate.mockClear()
    mockHandleCheckout.mockClear()
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

  it('renders View Bag and Proceed to Checkout when cart has items', () => {
    vi.mocked(useCartModal).mockReturnValue({
      ...defaultCartModalReturn,
      activeCartItems: [mockCartItem],
      totalItems: 1,
      subtotal: 100,
    } as any)
    renderWithProviders(<CartPopoverContent />)
    expect(screen.getByRole('button', { name: /View Bag \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Proceed to Checkout/ })).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    vi.mocked(useCartModal).mockReturnValue({
      ...defaultCartModalReturn,
      isLoading: true,
    } as any)
    renderWithProviders(<CartPopoverContent />)
    expect(screen.getByText('Loading cart...')).toBeInTheDocument()
  })
})
