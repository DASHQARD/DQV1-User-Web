import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Vendors from '../vendors/Vendors'

vi.mock('@/features/website/hooks/website', () => ({
  usePublicCatalogQueries: () => ({
    usePublicVendors: () => ({ data: [], isLoading: false }),
  }),
}))
vi.mock('../../components/VendorItems', () => ({
  VendorItems: () => <div data-testid="vendor-items">VendorItems</div>,
}))

describe('Vendors (website)', () => {
  it('renders partner vendor network heading', () => {
    renderWithProviders(<Vendors />)
    expect(screen.getAllByText('Partner Vendor Network').length).toBeGreaterThan(0)
  })

  it('shows search and filter controls when no vendors with cards', () => {
    renderWithProviders(<Vendors />)
    expect(screen.getByPlaceholderText('Search vendors by name...')).toBeInTheDocument()
    expect(screen.getByText('No vendors available')).toBeInTheDocument()
  })
})
