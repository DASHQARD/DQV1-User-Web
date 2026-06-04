import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import RecentRequests from '../RecentRequests'

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: { user_type: 'vendor' } }),
    }),
  }
})

const mockUseGetRequestsVendorService = vi.fn()
const mockUseGetRequestsCorporateSuperAdminVendorService = vi.fn()
const mockUseVendorPendingApprovalsCount = vi.fn(() => ({
  pendingCount: 0,
  isLoading: false,
}))

vi.mock('@/features/dashboard/hooks/useVendorOnboardingProgress', () => ({
  useVendorOnboardingProgress: () => ({
    getIsNavItemDisabled: () => false,
  }),
}))

vi.mock('@/features/dashboard/hooks/useVendorPendingApprovalsCount', () => ({
  useVendorPendingApprovalsCount: (...args: unknown[]) =>
    mockUseVendorPendingApprovalsCount(...args),
}))

vi.mock('@/features/dashboard/vendor/hooks', () => ({
  vendorQueries: () => ({
    useGetRequestsVendorService: mockUseGetRequestsVendorService,
  }),
}))

vi.mock('@/features/dashboard/corporate', () => ({
  corporateQueries: () => ({
    useGetRequestsCorporateSuperAdminVendorService:
      mockUseGetRequestsCorporateSuperAdminVendorService,
  }),
}))

describe('RecentRequests', () => {
  beforeEach(() => {
    mockUseGetRequestsVendorService.mockReturnValue({ data: [], isLoading: false })
    mockUseGetRequestsCorporateSuperAdminVendorService.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('renders title and View all link', () => {
    renderWithProviders(<RecentRequests />)
    expect(screen.getByRole('heading', { name: /Requests/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View all/i })).toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    renderWithProviders(<RecentRequests />)
    expect(screen.getByText('No requests to display')).toBeInTheDocument()
  })

  it('renders request list with total count and pending badge', () => {
    mockUseVendorPendingApprovalsCount.mockReturnValue({
      pendingCount: 1,
      isLoading: false,
    })

    mockUseGetRequestsVendorService.mockReturnValue({
      data: [
        {
          id: 1,
          request_id: 'RQ-001',
          type: 'approve experience',
          status: 'Awaiting Vendor Approval',
          current_approver_level: 'vendor_admin',
          description: 'approve experience request for card: Amazon Gift Card',
          name: 'Nana Kofi',
          created_at: '2026-06-03T10:00:00Z',
        },
      ],
      isLoading: false,
    })
    renderWithProviders(<RecentRequests />)
    expect(screen.getByText('(1)')).toBeInTheDocument()
    expect(screen.getByLabelText('1 pending approval')).toBeInTheDocument()
    expect(screen.getByText('RQ-001')).toBeInTheDocument()
    expect(screen.getByText('approve experience')).toBeInTheDocument()
    expect(screen.getByText(/Amazon Gift Card/)).toBeInTheDocument()
    expect(screen.getByText('Nana Kofi')).toBeInTheDocument()
  })
})
