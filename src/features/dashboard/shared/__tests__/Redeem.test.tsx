import { describe, it, expect, vi } from 'vitest'
import { EXAMPLE_PHONE_LOCAL } from '@/utils/constants'
import { renderWithProviders, screen } from '@/test/test-utils'
import Redeem from '../Redeem'

vi.mock('@/hooks', () => ({
  useCountriesData: () => ({ countries: [] }),
}))

vi.mock('../../hooks/useRedemptionForm', () => ({
  useRedemptionForm: () => ({
    form: { redemptionAmount: null },
    rawVendor: '',
    setRawVendor: vi.fn(),
    validatingVendor: false,
    vendorError: null,
    vendorName: null,
    isFormValid: false,
    isSubmitting: false,
    submitRedemption: vi.fn(),
    clearForm: vi.fn(),
    balance: null,
    balanceCheckComplete: false,
    balanceError: null,
    showSummaryModal: false,
    setShowSummaryModal: vi.fn(),
    setForm: vi.fn(),
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

vi.mock('../../components/RedemptionOTPModal', () => ({
  default: () => <div data-testid="redemption-otp-modal">RedemptionOTPModal</div>,
}))

describe('Redeem (dashboard shared)', () => {
  it('renders Redeem Your Gift Card heading', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Redeem Your Gift Card')).toBeInTheDocument()
  })

  it('renders Vendor Information section', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Vendor Information')).toBeInTheDocument()
    expect(screen.getByText(/vendor mobile money/i)).toBeInTheDocument()
  })

  it('renders Redemption Amount section', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Redemption Amount')).toBeInTheDocument()
  })

  it('renders Reset Form and Continue to Redemption buttons', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByRole('button', { name: /reset form/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue to redemption/i })).toBeInTheDocument()
  })

  it('renders Your Account Details section', () => {
    renderWithProviders(<Redeem />)
    expect(screen.getByText('Your Account Details')).toBeInTheDocument()
  })
})
