import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PartnerVendors } from '../PartnerVendors'

vi.mock('../../hooks/website', () => ({
  usePublicCatalogQueries: () => ({
    usePublicVendors: () => ({ data: [], isLoading: false }),
  }),
}))

describe('PartnerVendors', () => {
  it('renders Partner Vendors heading', () => {
    renderWithProviders(<PartnerVendors />)
    expect(screen.getByText('Partner Vendors')).toBeInTheDocument()
  })

  it('renders See more button', () => {
    renderWithProviders(<PartnerVendors />)
    expect(screen.getByRole('button', { name: /See more/i })).toBeInTheDocument()
  })
})
