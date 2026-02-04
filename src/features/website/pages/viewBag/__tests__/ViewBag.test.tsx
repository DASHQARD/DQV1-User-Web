import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import ViewBag from '../ViewBag'

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
vi.mock('../../hooks/useViewBagMutations', () => ({
  useViewBagMutations: () => ({
    deleteCartItemMutation: { mutate: vi.fn() },
    deleteRecipientMutation: { mutate: vi.fn() },
  }),
}))
vi.mock('../../hooks/website/usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({
    useGetCartAllRecipientsService: () => ({ data: null }),
  }),
}))
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: vi.fn(),
      closeModal: vi.fn(),
      isModalOpen: vi.fn(() => false),
    }),
    useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
  }
})

describe('ViewBag (website)', () => {
  it('renders MY BAG header', () => {
    renderWithProviders(<ViewBag />)
    expect(screen.getByText(/MY BAG/)).toBeInTheDocument()
  })

  it('shows empty bag message when no items', () => {
    renderWithProviders(<ViewBag />)
    expect(screen.getByText('Your bag is empty')).toBeInTheDocument()
    expect(screen.getByText('Add items to get started')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Browse Cards/i })).toBeInTheDocument()
  })
})
