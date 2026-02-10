import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CardItems } from '../CardItems'

vi.mock('@/features/website/hooks/useCardItem', () => ({
  useCardItem: () => ({
    isHovered: false,
    setIsHovered: vi.fn(),
    roundedRating: 4,
    cardBackground: '/test-bg.png',
    cardTypeName: 'DashX',
    displayPrice: 'GHS 100',
    handleQuickAdd: vi.fn(),
    handleCardClick: vi.fn(),
    product: 'Test Card',
    branch_name: 'Branch A',
    branch_location: 'Accra',
    vendor_name: 'Vendor Co',
    buttonText: 'Quick Add',
    rating: 4,
    isAdding: false,
  }),
}))

describe('CardItems', () => {
  it('renders card product and price', () => {
    renderWithProviders(
      <CardItems
        product="Test Card"
        price={100}
        currency="GHS"
        type="dashx"
        vendor_name="Vendor Co"
      />,
    )
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getAllByText('GHS 100').length).toBeGreaterThan(0)
  })

  it('renders Quick Add button', () => {
    renderWithProviders(<CardItems product="Test" price={50} currency="GHS" type="dashx" />)
    expect(screen.getAllByRole('button', { name: /Quick Add/i }).length).toBeGreaterThan(0)
  })
})
