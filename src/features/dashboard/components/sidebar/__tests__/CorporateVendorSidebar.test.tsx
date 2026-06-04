import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CorporateVendorSidebar from '../CorporateVendorSidebar'

const mockSetIsCollapsed = vi.fn()
vi.mock('@/features/dashboard/corporate/hooks', () => ({
  useCorporateVendorSidebar: () => ({
    navigate: vi.fn(),
    logout: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: mockSetIsCollapsed,
    isPopoverOpen: false,
    setIsPopoverOpen: vi.fn(),
    logoUrl: null,
    currentVendorLogoUrl: null,
    allVendorsCreatedByCorporate: [],
    hasVendorsPendingVerification: false,
    currentVendorId: null,
    vendorLogoUrls: {},
    isVendor: true,
    isCorporateSuperAdmin: false,
    displayName: 'Vendor User',
    corporateName: 'Acme Corp',
    vendorName: 'Test Vendor',
    vendorGvid: 'GV001',
    branchesArray: [],
    discoveryScore: 80,
    canAccessCorporate: true,
    pendingRequestsCount: 0,
    isBranchesExpanded: false,
    getIsNavItemDisabled: () => false,
    isSettingsDisabled: false,
    setIsBranchesExpanded: vi.fn(),
    isActive: (path: string) => path === '/dashboard/vendor',
    isBranchActive: () => false,
    addAccountParam: (path: string) => `${path}?account=vendor`,
    handleSwitchToVendor: vi.fn(),
  }),
}))

describe('CorporateVendorSidebar', () => {
  it('renders sidebar with vendor name and collapse button', () => {
    renderWithProviders(<CorporateVendorSidebar />)
    expect(screen.getByText(/Test Vendor/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CorporateVendorSidebar />)
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(mockSetIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('renders discovery score when not 100', () => {
    renderWithProviders(<CorporateVendorSidebar />)
    expect(screen.getByText('Discovery score')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
