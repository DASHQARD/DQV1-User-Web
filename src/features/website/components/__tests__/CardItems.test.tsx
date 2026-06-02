import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import type { FeaturedCardProps } from '@/types'
import { CardItems } from '../CardItems'

vi.mock('@/features/website/hooks/useCardItem', () => ({
  useCardItem: () => ({
    isHovered: false,
    setIsHovered: vi.fn(),
    roundedRating: 4,
    cardBackground: '/test-bg.png',
    cardTypeName: 'DashX',
    displayPrice: 'GHS 100',
    displayProduct: 'Test Card',
    handleQuickAdd: vi.fn(),
    handleCardClick: vi.fn(),
    product: 'Test Card',
    branch_name: 'Branch A',
    branch_location: 'Accra',
    vendor_name: 'Vendor Co',
    buttonText: 'Quick Add',
    rating: 4,
    isAdding: false,
    isPurchasable: true,
  }),
}))

describe('CardItems', () => {
  it('renders card product and price', () => {
    renderWithProviders(
      <CardItems
        {...({
          product: 'Test Card',
          price: '100',
          currency: 'GHS',
          type: 'dashx',
          vendor_name: 'Vendor Co',
        } as FeaturedCardProps)}
      />,
    )
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getAllByText('GHS 100').length).toBeGreaterThan(0)
  })

  it('renders status progress bar in compact density', () => {
    renderWithProviders(
      <CardItems
        {...({
          product: 'Test',
          price: '50',
          currency: 'GHS',
          type: 'dashx',
          status: 'active',
          expiry_date: '2026-06-30T00:00:00.000Z',
        } as FeaturedCardProps)}
        density="compact"
      />,
    )
    expect(screen.getByRole('progressbar', { name: /Card status: active/i })).toBeInTheDocument()
  })
})
