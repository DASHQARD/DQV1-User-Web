import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorItems } from '../VendorItems'

const branchesWithCards = [
  {
    cards: [
      { card_type: 'DashX', card_price: 50, currency: 'GHS', card_status: 'active' },
      { card_type: 'DashPass', card_price: 120, currency: 'GHS', card_status: 'active' },
    ],
  },
]

describe('VendorItems', () => {
  it('renders bold banner layout with vendor name, tags, and stats', () => {
    renderWithProviders(
      <VendorItems
        name="Test Vendor"
        businessCountry="Ghana"
        branchesWithCards={branchesWithCards}
      />,
    )
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
    expect(screen.getByText('DashX')).toBeInTheDocument()
    expect(screen.getByText('DashPass')).toBeInTheDocument()
    expect(screen.getByText('cards')).toBeInTheDocument()
    expect(screen.getByText('branches')).toBeInTheDocument()
    expect(screen.getByText('Price range')).toBeInTheDocument()
    expect(screen.getByText(/GHS 50.*120/)).toBeInTheDocument()
  })

  it('shows price range on compact variant', () => {
    renderWithProviders(
      <VendorItems name="Vendor" branchesWithCards={branchesWithCards} variant="compact" />,
    )
    expect(screen.getByText(/GHS 50.*120/)).toBeInTheDocument()
  })
})
