import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorHome from '../home/VendorHome'

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: { user_type: 'vendor', vendor_id: 1 },
    }),
  }),
}))

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetBranchesByVendorIdService: () => ({ data: [], isLoading: false }),
    useGetCardsByVendorIdService: () => ({ data: { data: [] }, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetCorporateBranchesListService: () => ({ data: [], isLoading: false }),
    useGetCorporateBranchesByVendorIdService: () => ({ data: [], isLoading: false }),
    useGetCorporateSuperAdminCardsService: () => ({ data: [], isLoading: false }),
    useGetCardsByVendorIdForCorporateService: () => ({ data: [], isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/components', () => ({
  VendorSummaryCards: () => <div data-testid="vendor-summary-cards">Summary</div>,
  CompleteVendorWidget: () => <div data-testid="complete-vendor-widget">Widget</div>,
  RecentRequests: () => <div data-testid="recent-requests">Recent Requests</div>,
  RecentExperiences: () => <div data-testid="recent-experiences">Recent Experiences</div>,
  RecentBranches: () => <div data-testid="recent-branches">Recent Branches</div>,
}))

describe('VendorHome', () => {
  it('renders Vendor Dashboard heading', () => {
    renderWithProviders(<VendorHome />)
    expect(screen.getByText('Vendor Dashboard')).toBeInTheDocument()
  })

  it('renders VendorSummaryCards', () => {
    renderWithProviders(<VendorHome />)
    expect(screen.getByTestId('vendor-summary-cards')).toBeInTheDocument()
  })

  it('renders RecentExperiences and RecentBranches', () => {
    renderWithProviders(<VendorHome />)
    expect(screen.getByTestId('recent-experiences')).toBeInTheDocument()
    expect(screen.getByTestId('recent-branches')).toBeInTheDocument()
  })

  it('renders CompleteVendorWidget', () => {
    renderWithProviders(<VendorHome />)
    expect(screen.getByTestId('complete-vendor-widget')).toBeInTheDocument()
  })
})
