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
    id_images: [],
    onboarding_progress: { upload_id_completed: false },
  }
  return {
    useUserProfile: () => ({
      useGetUserProfileService: () => ({
        data: stableUser,
      }),
    }),
    useUploadFiles: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useToast: () => ({
      success: vi.fn(),
      error: vi.fn(),
    }),
  }
})
vi.mock('@/features/auth/hooks/auth', () => ({
  useAuth: () => ({
    usePersonalDetailsWithIDService: () => ({
      mutateAsync: vi.fn(),
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

  it('renders Ghana Card upload fields in onboarding section', () => {
    const { getByText } = renderWithProviders(<UserDashboard />)
    expect(getByText(/let's get to know you/i)).toBeInTheDocument()
    expect(getByText(/ghana card photos/i)).toBeInTheDocument()
    expect(getByText(/front of ghana card/i)).toBeInTheDocument()
    expect(getByText(/back of ghana card/i)).toBeInTheDocument()
  })
})
