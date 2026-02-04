import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import VendorSummaryCards from '../VendorSummaryCards'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { user_type: 'vendor' } }),
  }),
}))

vi.mock('@/stores', () => ({ useAuthStore: () => ({ user: { user_type: 'vendor' } }) }))

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetVendorCardCountsService: () => ({ data: { DashX: 5, DashPass: 3 }, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetCorporateSuperAdminCardsService: () => ({ data: [], isLoading: false }),
    useGetCorporateSuperAdminVendorCardsSummaryService: () => ({ data: null, isLoading: false }),
  }),
}))

describe('VendorSummaryCards', () => {
  it('renders card metrics when data is loaded', () => {
    renderWithProviders(<VendorSummaryCards />)
    expect(screen.getByText(/DashX/i)).toBeInTheDocument()
    expect(screen.getByText(/DashPass/i)).toBeInTheDocument()
  })
})
