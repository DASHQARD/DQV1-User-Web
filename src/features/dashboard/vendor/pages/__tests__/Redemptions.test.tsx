import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Redemptions from '../redemptions/Redemptions'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  const stableUser = { user_type: 'vendor' }
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: () => ({ data: stableUser }),
    }),
    useReducerSpread: () => [{ limit: 10 }, vi.fn()],
  }
})

vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({
    useGetVendorRedemptionsService: () => ({
      data: { data: [], pagination: {} },
      isLoading: false,
    }),
  }),
}))

vi.mock('@/features/dashboard/branch/hooks', () => ({
  branchQueries: () => ({
    useGetBranchRedemptionsService: () => ({ data: null, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetCorporateRedemptionsService: () => ({ data: null, isLoading: false }),
    useGetCorporateRedemptionsByVendorIdService: () => ({ data: null, isLoading: false }),
  }),
}))

vi.mock('@/features/dashboard/components', () => ({
  redemptionListColumns: [],
  redemptionListCsvHeaders: [],
}))

describe('Redemptions (vendor)', () => {
  it('renders Redemptions heading', () => {
    renderWithProviders(<Redemptions />)
    expect(screen.getAllByText('Redemptions')[0]).toBeInTheDocument()
  })

  it('renders filter and table', () => {
    renderWithProviders(<Redemptions />)
    expect(screen.getByRole('button', { name: /Filter by card_type/i })).toBeInTheDocument()
    expect(screen.getAllByRole('table').length).toBeGreaterThan(0)
  })
})
