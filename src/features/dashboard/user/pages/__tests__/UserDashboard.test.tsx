import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import UserDashboard from '../home/UserDashboard'

vi.mock('@/features/dashboard/hooks/useCards', () => ({
  useGiftCardMetrics: () => ({ data: null, isLoading: false }),
}))
vi.mock('@/features/dashboard/hooks', () => ({
  usePaymentInfoService: () => ({
    useGetPaymentByIdService: () => ({ data: [], isLoading: false }),
  }),
}))
vi.mock('@/hooks', () => {
  const stableUser = {
    fullname: '',
    street_address: '',
    dob: '',
    id_type: '',
    id_number: '',
  }
  return {
    useUserProfile: () => ({
      useGetUserProfileService: () => ({
        data: stableUser,
      }),
    }),
  }
})
vi.mock('@/features/auth/hooks/auth', () => ({
  useAuth: () => ({
    usePersonalDetailsService: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  }),
}))

describe('UserDashboard (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Dashboard title', () => {
    const { getByText } = renderWithProviders(<UserDashboard />)
    expect(getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    const { getByText } = renderWithProviders(<UserDashboard />)
    expect(getByText(/welcome back/i)).toBeInTheDocument()
  })
})
