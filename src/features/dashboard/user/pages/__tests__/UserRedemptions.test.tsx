import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import UserRedemptions from '../redemptions/UserRedemptions'

vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({
    useGetUserRedemptionsService: () => ({
      data: { data: [], pagination: undefined },
      isLoading: false,
    }),
  }),
}))

describe('UserRedemptions (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Redemptions title', () => {
    const { getAllByText } = renderWithProviders(<UserRedemptions />)
    expect(getAllByText('Redemptions').length).toBeGreaterThan(0)
  })
})
