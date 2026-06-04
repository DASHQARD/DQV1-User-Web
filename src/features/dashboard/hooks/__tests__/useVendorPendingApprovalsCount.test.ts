import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useVendorPendingApprovalsCount } from '../useVendorPendingApprovalsCount'

const mockUseGetRequestsVendorService = vi.fn()
const mockUseGetRequestsCorporateSuperAdminVendorService = vi.fn()

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { user_type: 'vendor' } }),
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/features/dashboard/vendor/hooks', () => ({
  vendorQueries: () => ({
    useGetRequestsVendorService: mockUseGetRequestsVendorService,
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetRequestsCorporateSuperAdminVendorService:
      mockUseGetRequestsCorporateSuperAdminVendorService,
  }),
}))

describe('useVendorPendingApprovalsCount', () => {
  beforeEach(() => {
    mockUseGetRequestsVendorService.mockReturnValue({
      data: [
        {
          status: 'Awaiting Vendor Approval',
          current_approver_level: 'vendor_admin',
        },
        {
          status: 'awaiting corporate approval',
          current_approver_level: 'corporate_admin',
        },
      ],
      isLoading: false,
    })
    mockUseGetRequestsCorporateSuperAdminVendorService.mockReturnValue({
      data: null,
      isLoading: false,
    })
  })

  it('counts only vendor-actionable pending requests', () => {
    const { result } = renderHook(() => useVendorPendingApprovalsCount())
    expect(result.current.pendingCount).toBe(1)
  })

  it('returns zero when disabled', () => {
    const { result } = renderHook(() => useVendorPendingApprovalsCount({ enabled: false }))
    expect(result.current.pendingCount).toBe(0)
  })
})
