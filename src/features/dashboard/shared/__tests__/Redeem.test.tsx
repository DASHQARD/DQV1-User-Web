import { describe, it, expect, vi } from 'vitest'
import { EXAMPLE_PHONE_LOCAL } from '@/utils/constants'
import { renderWithProviders, screen } from '@/test/test-utils'
import Redeem from '../Redeem'

vi.mock('@/hooks', () => ({
  useCountriesData: () => ({ countries: [] }),
}))

vi.mock('../../hooks/useRedemptionForm', () => ({
  useRedemptionForm: () => ({
    cardType: 'DashPro',
    setCardType: vi.fn(),
    redemptionAmount: null,
    setRedemptionAmount: vi.fn(),
    rawVendorPhone: '',
    setRawVendorPhone: vi.fn(),
    validatingVendor: false,
    vendorPhoneError: null,
    vendorPhoneName: null,
    vendorSearch: '',
    setVendorSearch: vi.fn(),
    vendorSearchResults: [],
    isSearchingVendors: false,
    selectedVendor: null,
    handleSelectVendor: vi.fn(),
    availableBalance: null,
    balanceLoading: false,
    balanceError: null,
    cardPreviewImageUrl: undefined,
    isFormValid: false,
    isSubmitting: false,
    submitRedemption: vi.fn(),
    clearForm: vi.fn(),
    showSummaryModal: false,
    setShowSummaryModal: vi.fn(),
  }),
}))

vi.mock('../../hooks/useUserInfo', () => ({
  useUserInfo: () => ({
    userInfo: { name: 'Test User', phone: EXAMPLE_PHONE_LOCAL, email: 'test@example.com' },
  }),
}))

vi.mock('../../components/RedemptionSummary', () => ({
  default: () => <div data-testid="redemption-summary">RedemptionSummary</div>,
}))

describe('Redeem (dashboard shared)', () => {
  it('renders Redeem Your Gift Card heading', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Redeem Your Gift Card')).toBeInTheDocument()
  })

  it('renders vendor section for DashPro', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Vendor Mobile Money')).toBeInTheDocument()
    expect(screen.getByText(/vendor's mobile money number/i)).toBeInTheDocument()
  })

  it('renders Redemption Amount section', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Redemption Amount')).toBeInTheDocument()
  })

  it('renders Reset and Redeem Now buttons', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redeem now/i })).toBeInTheDocument()
  })

  it('renders Your Account section', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Your Account')).toBeInTheDocument()
  })
})
