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
  it('renders vendor name and catalog stats on one line', () => {
    renderWithProviders(
      <VendorItems name="Test Vendor" businessCountry="Ghana" branchesWithCards={branchesWithCards} />,
    )
    expect(screen.getByText('Test Vendor')).toBeInTheDocument()
    expect(screen.getByText('Ghana')).toBeInTheDocument()
    expect(screen.getByText('2 cards · 1 branch')).toBeInTheDocument()
    expect(screen.getByText('DashX · DashPass')).toBeInTheDocument()
    expect(screen.getByText(/GHS 50/)).toBeInTheDocument()
  })

  it('shows from-price only on compact variant', () => {
    renderWithProviders(
      <VendorItems name="Vendor" branchesWithCards={branchesWithCards} variant="compact" />,
    )
    expect(screen.getByText(/From GHS 50/)).toBeInTheDocument()
    expect(screen.queryByText(/GHS 120/)).not.toBeInTheDocument()
  })

  it('shows full price range on default variant', () => {
    renderWithProviders(
      <VendorItems name="Vendor" branchesWithCards={branchesWithCards} variant="default" />,
    )
    expect(screen.getByText(/GHS 50.*GHS 120/)).toBeInTheDocument()
  })
})
