import { describe, it, expect, vi } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders, screen } from '@/test/test-utils'
import CardDetails from '../CardDetails'

vi.mock('@/assets/svgs/Dashx_bg.svg', () => ({ default: '/dashx-bg.svg' }))
vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))
vi.mock('@/assets/images/dashpass_bg.png', () => ({ default: '/dashpass-bg.png' }))
vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo-bg.svg' }))

const mockCard = {
  card_id: 1,
  id: 1,
  product: 'Test Card',
  price: 100,
  currency: 'GHS',
  vendor_id: 1,
  vendor_name: 'Test Vendor',
  status: 'active',
  images: [],
  terms_and_conditions: [],
}

vi.mock('../../hooks/website', () => ({
  usePublicCatalogQueries: () => ({
    usePublicCardsService: () => ({ data: [mockCard], isLoading: false }),
    usePublicVendorsService: () => ({ data: [] }),
  }),
}))
vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({ addToCartAsync: vi.fn(), isAdding: false, openCart: vi.fn() }),
}))
vi.mock('@/stores/cart', () => ({ useCartStore: () => ({ openCart: vi.fn() }) }))
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return { ...actual, usePresignedURL: () => ({ mutateAsync: vi.fn().mockResolvedValue('') }) }
})

function CardDetailsRoute() {
  return (
    <Routes>
      <Route path="/card/:id" element={<CardDetails />} />
    </Routes>
  )
}

describe('CardDetails (website)', () => {
  it('shows "Card not found" when id is set but card is not in list', () => {
    renderWithProviders(<CardDetailsRoute />, { initialEntries: ['/card/999'] })
    expect(screen.getByText('Card not found')).toBeInTheDocument()
    expect(screen.getByText("The card you're looking for doesn't exist.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse all cards/i })).toBeInTheDocument()
  })

  it('shows card product and "Back to Cards" when card is found', () => {
    renderWithProviders(<CardDetailsRoute />, { initialEntries: ['/card/1'] })
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText(/Back to Cards/)).toBeInTheDocument()
  })
})
