import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CorporateSidebar from '../CorporateSidebar'

const mockSetIsCollapsed = vi.fn()
vi.mock('@/features/dashboard/corporate/hooks', () => ({
  useCorporateSidebar: () => ({
    user: {
      user_type: 'corporate_super_admin',
      business_details: [{ name: 'Acme Corp' }],
      corporate_id: 'C001',
      corporate_id_from_business: 'C001',
    },
    allVendorsCreatedByCorporate: [],
    hasVendorsPendingVerification: false,
    pendingRequestsCount: 0,
    logoUrl: null,
    vendorLogoUrls: {},
    isCollapsed: false,
    setIsCollapsed: mockSetIsCollapsed,
    isPopoverOpen: false,
    setIsPopoverOpen: vi.fn(),
    vendorAccountModal: { openModal: vi.fn() },
    displayName: 'Admin',
    onboardingProgress: 50,
    canAccessRestrictedFeatures: true,
    isCorporateAdmin: false,
    isActive: (path: string) => path === '/dashboard/corporate',
    getProcessedItems: (section: { items: any[] }) => section.items,
    logout: vi.fn(),
    navigate: vi.fn(),
    addAccountParam: (path: string) => `${path}?account=corporate`,
  }),
}))

describe('CorporateSidebar', () => {
  it('renders sidebar with corporate account and collapse button', () => {
    renderWithProviders(<CorporateSidebar />)
    expect(screen.getByText(/Acme Corp|Corporate Account/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CorporateSidebar />)
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(mockSetIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('renders Log Out in footer', () => {
    renderWithProviders(<CorporateSidebar />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
