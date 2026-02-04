import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import RedemptionPage from '../RedemptionPage'

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ isAuthenticated: false }),
}))
vi.mock('@/features/website/hooks/website/usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({
    usePublicVendorsService: () => ({ data: [] }),
  }),
}))
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useCountriesData: () => ({ countries: [] }),
    useUserProfile: () => ({ useGetUserProfileService: () => ({ data: null }) }),
    useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
  }
})
vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({
    useGetRedemptionsAmountDashGoService: () => ({ data: null, isLoading: false }),
    useGetRedemptionsAmountDashProService: () => ({ data: null, isLoading: false }),
    useGetRedemptionsAmountDashXService: () => ({ data: null, isLoading: false }),
    useGetRedemptionsAmountDashPassService: () => ({ data: null, isLoading: false }),
  }),
  useRedemptionMutation: () => ({
    useProcessRedemptionCardsService: () => ({ mutateAsync: vi.fn() }),
    useProcessCardsRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useInitiateRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useProcessDashProRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useProcessDashProRedemptionForUserService: () => ({ mutateAsync: vi.fn() }),
    useValidateVendorMobileMoneyService: () => ({ mutateAsync: vi.fn() }),
  }),
  useRateCard: () => ({}),
}))
vi.mock('@/features/website/components/RedemptionOTPModal', () => ({
  default: () => <div data-testid="redemption-otp-modal">OTP Modal</div>,
}))

describe('RedemptionPage (website)', () => {
  it('renders redemption heading and method selection', () => {
    renderWithProviders(<RedemptionPage />)
    expect(screen.getByText('Redeem Your Gift Card')).toBeInTheDocument()
    expect(screen.getByText('Secure Gift Card Redemption')).toBeInTheDocument()
    expect(screen.getByText('Select Redemption Method')).toBeInTheDocument()
  })
})
