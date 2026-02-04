import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Requests from '../requests/Requests'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: { user_type: 'vendor' } }),
    }),
    useReducerSpread: () => [{}, vi.fn()],
  }
})

vi.mock('../../hooks', () => ({
  vendorQueries: () => ({
    useGetRequestsVendorService: () => ({ data: { data: [] }, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/components/vendors/modals', () => ({
  VendorRequestDetails: () => null,
  VendorApproveAction: () => null,
  VendorRejectAction: () => null,
  VendorDeleteRequestModal: () => null,
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetRequestsCorporateSuperAdminVendorService: () => ({ data: null, isLoading: false }),
  }),
}))

describe('Requests (vendor)', () => {
  it('renders page content', () => {
    renderWithProviders(<Requests />)
    expect(screen.getByText('All requests')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/search by name, description, module, or status/i),
    ).toBeInTheDocument()
  })
})
