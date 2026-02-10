import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useBranchDetails } from '../useBranchDetails'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: undefined }),
    useSearchParams: () => [new URLSearchParams(''), vi.fn()],
  }
})

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => false,
  }),
  useUserProfile: () => ({
    useGetUserProfileService: () => ({
      data: { user_type: 'vendor', vendor_id: 10 },
    }),
  }),
}))

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ user: { user_type: 'vendor' } }),
}))

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetAllVendorsDetailsForVendorService: () => ({
      data: null,
      isLoading: false,
    }),
    useGetBranchesByVendorIdService: () => ({
      data: [
        {
          id: 1,
          branch_id: 1,
          branch_name: 'Test Branch',
          branch_location: 'Accra',
          status: 'approved',
          vendor_id: 10,
        },
      ],
      isLoading: false,
      isError: false,
    }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetCorporateBranchByIdService: () => ({ data: null, isLoading: false, isError: false }),
    useGetCorporateBranchManagersService: () => ({}),
    useGetCorporateBranchRedemptionsService: () => ({ data: null, isLoading: false }),
    useGetCorporateBranchCardsService: () => ({ data: null }),
    useGetCorporateBranchSummaryService: () => ({ data: null, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({
    useGetVendorRedemptionsListService: () => ({ data: { data: [] }, isLoading: false }),
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('useBranchDetails', () => {
  it('returns expected shape with branches when vendor has branch data', () => {
    const { result } = renderHook(() => useBranchDetails(), {
      wrapper: createWrapper(),
    })

    expect(result.current).toMatchObject({
      branchModal: expect.any(Object),
      experienceModal: expect.any(Object),
      branchStatusModal: expect.any(Object),
      goToBranches: expect.any(Function),
      isLoadingRedemptions: expect.any(Boolean),
      isLoadingCorporateBranchSummary: expect.any(Boolean),
    })
    expect(result.current.branches).toBeDefined()
    expect(result.current.branches?.branch_name).toBe('Test Branch')
    expect(result.current.experiences).toEqual(expect.any(Array))
    expect(result.current.recentRedemptions).toEqual(expect.any(Array))
    expect(result.current.isLoading).toBe(false)
  })

  it('goToBranches navigates to branches route', () => {
    const { result } = renderHook(() => useBranchDetails(), {
      wrapper: createWrapper(),
    })

    result.current.goToBranches()
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/branches/))
  })
})
