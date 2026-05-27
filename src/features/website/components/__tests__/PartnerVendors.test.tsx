import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PartnerVendors } from '../PartnerVendors'

vi.mock('../../hooks/website/useHomePageCatalog', () => ({
  useHomePageCatalog: () => ({ vendors: [], isLoading: false, isLoadingVendors: false }),
}))

describe('PartnerVendors', () => {
  it('renders Partner Vendors heading', () => {
    renderWithProviders(<PartnerVendors />)
    expect(screen.getByText('Partner Vendors')).toBeInTheDocument()
  })

  it('renders All link', () => {
    renderWithProviders(<PartnerVendors />)
    expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument()
  })
})
