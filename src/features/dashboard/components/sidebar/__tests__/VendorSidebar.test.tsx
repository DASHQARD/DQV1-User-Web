import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorSidebar from '../VendorSidebar'

const mockSetIsCollapsed = vi.fn()
vi.mock('@/features/dashboard/vendor/hooks', () => ({
  useVendorSidebar: () => ({
    navigate: vi.fn(),
    logout: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: mockSetIsCollapsed,
    isPopoverOpen: false,
    setIsPopoverOpen: vi.fn(),
    logoUrl: null,
    currentVendorLogoUrl: null,
    vendorLogoUrls: {},
    isVendor: false,
    displayName: 'Vendor User',
    corporateName: null,
    corporateId: null,
    currentVendorId: 1,
    vendorsToSwitchTo: [],
    vendorName: 'Test Vendor',
    vendorGvid: 'GV001',
    branchesArray: [],
    discoveryScore: 75,
    canAccessCorporate: false,
    pendingRequestsCount: 0,
    isBranchesExpanded: false,
    setIsBranchesExpanded: vi.fn(),
    isActive: (path: string) => path === '/dashboard/vendor',
    isBranchActive: () => false,
    addAccountParam: (path: string) => `${path}?account=vendor`,
    handleSwitchToVendor: vi.fn(),
    getIsNavItemDisabled: () => false,
    isSettingsDisabled: false,
  }),
}))

describe('VendorSidebar', () => {
  it('renders sidebar with vendor name and collapse button', () => {
    renderWithProviders(<VendorSidebar />)
    expect(screen.getByText(/Test Vendor/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VendorSidebar />)
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(mockSetIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('renders discovery score when not 100', () => {
    renderWithProviders(<VendorSidebar />)
    expect(screen.getByText('Discovery score')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('renders Settings and Log Out in footer', () => {
    renderWithProviders(<VendorSidebar />)
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
