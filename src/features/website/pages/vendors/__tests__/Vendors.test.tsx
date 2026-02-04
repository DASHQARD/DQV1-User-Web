import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Vendors from '../Vendors'

vi.mock('@/features/website/hooks/website', () => ({
  usePublicCatalog: () => ({
    vendors: [],
    vendorsLoading: false,
    query: { search: '' },
    setQuery: vi.fn(),
  }),
}))
vi.mock('../../components/VendorItems', () => ({
  VendorItems: () => <div data-testid="vendor-items">VendorItems</div>,
}))

describe('Vendors (website)', () => {
  it('renders hero heading', () => {
    renderWithProviders(<Vendors />)
    expect(screen.getByText('Discover Our Partner Vendors')).toBeInTheDocument()
  })

  it('shows loading or empty state when no vendors with cards', () => {
    renderWithProviders(<Vendors />)
    expect(screen.getByPlaceholderText('Search vendors by name...')).toBeInTheDocument()
    // With mocked usePublicCatalog returning empty vendors, we see empty state
    expect(screen.getByText('No vendors available')).toBeInTheDocument()
  })
})
