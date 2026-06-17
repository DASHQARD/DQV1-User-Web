import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen, waitFor } from '@/test/test-utils'
import RedemptionPage from '../redemption/RedemptionPage'

const { mockAuthState, mockDashProResponse, mockVendorMobileMoney } = vi.hoisted(() => ({
  mockAuthState: {
    isAuthenticated: false,
    isGuestAuth: false,
    user: null as null,
    authenticate: vi.fn(),
  },
  mockDashProResponse: {
    data: { total_balance: 190.62 },
    isLoading: false,
    isError: false,
    error: null,
  },
  mockVendorMobileMoney: {
    rawVendorPhone: '244810501',
    setRawVendorPhone: vi.fn(),
    validatingVendor: false,
    vendorPhoneError: null,
    vendorPhoneName: 'SOPHIA OWUSU ASAFO ADJEI',
    momoResolveWarning: null,
    isVendorPhoneVerified: true,
    resolvedProvider: 'mtn' as const,
    resetVendorMobileMoney: vi.fn(),
  },
}))

vi.mock('@/stores', () => ({
  useAuthStore: (selector?: (s: typeof mockAuthState) => unknown) =>
    selector ? selector(mockAuthState) : mockAuthState,
  useGuestAddToCartModalStore: () => ({
    open: vi.fn(),
    close: vi.fn(),
  }),
}))
vi.mock('@/features/website/hooks/website/usePublicCatalogQueries', () => ({
  usePublicCatalogQueries: () => ({
    usePublicVendorsService: () => ({ data: [] }),
  }),
}))
vi.mock('@/features/website/hooks/useRedemptionVendorMobileMoney', () => ({
  useRedemptionVendorMobileMoney: () => mockVendorMobileMoney,
}))
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useCountriesData: () => ({ countries: [{ code: 'GH', dial_code: '+233' }] }),
    useUserProfile: () => ({
      useGetUserProfileService: () => ({
        data: { phonenumber: '2441234567' },
      }),
    }),
    useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
    useNetworkStatus: () => ({ isOnline: true }),
  }
})
vi.mock('@/features/dashboard/hooks', () => ({
  useRedemptionQueries: () => ({
    useGetRedemptionsAmountDashGoService: () => ({ data: null, isLoading: false }),
    useGetRedemptionsAmountDashProService: () => mockDashProResponse,
    useGetRedemptionsAmountDashXService: () => ({ data: null, isLoading: false }),
    useGetRedemptionsAmountDashPassService: () => ({ data: null, isLoading: false }),
    useGetGuestAssignedCardsService: () => ({ data: null, isLoading: false }),
    useGetGuestRedemptionsService: () => ({ data: null, isLoading: false }),
    useGetRedeemableCardsService: () => ({ data: null, isLoading: false }),
    useSearchVendorsService: () => ({ data: null, isFetching: false }),
    useSearchVendorByGvidService: () => ({ data: null, isFetching: false }),
  }),
  useRedemptionMutation: () => ({
    useProcessRedemptionCardsService: () => ({ mutateAsync: vi.fn() }),
    useProcessUserRedemptionCardsService: () => ({ mutateAsync: vi.fn() }),
    useProcessCardsRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useProcessGuestCardsRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useProcessDashProRedemptionForUserService: () => ({ mutateAsync: vi.fn() }),
    useProcessDashProRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useInitiateRedemptionService: () => ({ mutateAsync: vi.fn() }),
    useValidateVendorMobileMoneyService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
  useRateCard: () => ({}),
}))
vi.mock('@/features/website/components/RedemptionOTPModal', () => ({
  default: () => <div data-testid="redemption-otp-modal">OTP Modal</div>,
}))

describe('RedemptionPage (website)', () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = false
    mockAuthState.isGuestAuth = false
    mockDashProResponse.data = { total_balance: 190.62 }
    mockDashProResponse.isLoading = false
    mockVendorMobileMoney.isVendorPhoneVerified = true
  })

  it('renders redemption heading and method selection', () => {
    renderWithProviders(<RedemptionPage />)
    expect(screen.getByText('Redeem Your Gift Card')).toBeInTheDocument()
    expect(screen.getByText('Secure Gift Card Redemption')).toBeInTheDocument()
    expect(screen.getByText('Select Redemption Method')).toBeInTheDocument()
    expect(screen.getByText('Vendor mobile money')).toBeInTheDocument()
    expect(screen.getByText('Vendor ID')).toBeInTheDocument()
  })

  it('shows insufficient DashPro balance error when vendor MM amount exceeds balance', async () => {
    mockAuthState.isAuthenticated = true
    const user = userEvent.setup()

    renderWithProviders(<RedemptionPage />, {
      initialEntries: ['/redeem?method=vendor_mobile_money'],
    })

    const amountInput = await screen.findByPlaceholderText('Enter amount to redeem')
    await waitFor(() => {
      expect(screen.getByText('GHS 190.62')).toBeInTheDocument()
    })

    await user.clear(amountInput)
    await user.type(amountInput, '5900')

    await waitFor(() => {
      expect(
        screen.getAllByText('Insufficient DashPro balance. Available: GHS 190.62').length,
      ).toBeGreaterThan(0)
    })
    expect(screen.getByRole('button', { name: 'Redeem DashPro' })).toBeDisabled()
  })
})
