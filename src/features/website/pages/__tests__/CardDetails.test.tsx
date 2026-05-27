import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders, screen } from '@/test/test-utils'
import CardDetails from '../cardDetails/CardDetails'

vi.mock('@/assets/svgs/Dashx_bg.svg', () => ({ default: '/dashx-bg.svg' }))
vi.mock('@/assets/svgs/dashpro_bg.svg', () => ({ default: '/dashpro-bg.svg' }))
vi.mock('@/assets/images/dashpass_bg.png', () => ({ default: '/dashpass-bg.png' }))
vi.mock('@/assets/svgs/dashgo_bg.svg', () => ({ default: '/dashgo-bg.svg' }))

vi.mock('yet-another-react-lightbox', () => ({ default: () => null }))

const mockCard = {
  card_id: 1,
  id: 1,
  product: 'test request approval flow',
  price: 100,
  currency: 'GHS',
  vendor_id: 1,
  vendor_name: 'Test Vendor',
  status: 'active',
  images: [],
  terms_and_conditions: [],
}

const mockUseCardDetails = vi.fn()

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>()
  return {
    ...actual,
    useCardDetails: () => mockUseCardDetails(),
  }
})

vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({ addToCartAsync: vi.fn(), isAdding: false }),
}))
vi.mock('@/stores/cart', () => ({ useCartStore: () => ({ openCart: vi.fn() }) }))

function CardDetailsRoute() {
  return (
    <Routes>
      <Route path="/card/:id" element={<CardDetails />} />
    </Routes>
  )
}

function buildHookReturn(overrides: Record<string, unknown> = {}) {
  return {
    card: mockCard,
    isLoading: false,
    redemptionBranches: [
      { branch_name: 'Arsenal Branch', branch_location: 'East Legon' },
    ],
    selectedDocument: null,
    setSelectedDocument: vi.fn(),
    selectedImageIndex: 0,
    setSelectedImageIndex: vi.fn(),
    lightboxIndex: -1,
    openLightbox: vi.fn(),
    closeLightbox: vi.fn(),
    getCardTypeName: () => 'DASHPASS',
    handleAddToCart: vi.fn(),
    isAdding: false,
    lightboxImages: [],
    displayPrice: 100,
    displayProduct: 'Test Request Approval Flow',
    vendorDisplayName: 'Test Vendor',
    cardBackground: '/dashpass-bg.png',
    priceBreakdown: null,
    formattedExpiry: 'Jun 6, 2026',
    ...overrides,
  }
}

describe('CardDetails (website)', () => {
  beforeEach(() => {
    mockUseCardDetails.mockReset()
  })

  it('shows "Card not found" when id is set but card is not in list', () => {
    mockUseCardDetails.mockReturnValue(buildHookReturn({ card: null, displayProduct: '' }))
    renderWithProviders(<CardDetailsRoute />, { initialEntries: ['/card/999'] })
    expect(screen.getByText('Card not found')).toBeInTheDocument()
    expect(screen.getByText(/may have been removed/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse all cards/i })).toBeInTheDocument()
  })

  it('shows title-cased product name and cart actions when card is found', () => {
    mockUseCardDetails.mockReturnValue(buildHookReturn())
    renderWithProviders(<CardDetailsRoute />, { initialEntries: ['/card/1'] })
    expect(
      screen.getByRole('heading', { name: 'Test Request Approval Flow' }),
    ).toBeInTheDocument()
    expect(screen.getAllByText(/Add to cart/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /^Cards$/i })).toBeInTheDocument()
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
  })
})
