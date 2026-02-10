import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import PaymentInfoForm from '../PaymentInfoForm'

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const mockMutate = vi.fn()
vi.mock('../hooks/usePayment', () => ({
  usePaymentInfoService: () => ({
    useUpdatePaymentInfoService: () => ({ mutate: mockMutate, isPending: false }),
  }),
}))

const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: null })
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({ useGetUserProfileService: mockUseGetUserProfileService }),
    useCountriesData: () => ({ countries: [] }),
  }
})

describe('PaymentInfoForm', () => {
  beforeEach(() => {
    mockMutate.mockClear()
    mockUseGetUserProfileService.mockReturnValue({ data: null })
  })

  it('renders form with payment method options', () => {
    renderWithProviders(<PaymentInfoForm />)
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByText('Mobile Money')).toBeInTheDocument()
    expect(screen.getByText('Bank Account')).toBeInTheDocument()
  })

  it('prefills mobile money when user has momo_accounts', () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: {
        momo_accounts: [{ provider: 'mtn', momo_number: '233241234567' }],
      },
    })
    renderWithProviders(<PaymentInfoForm />)
    expect(screen.getByDisplayValue('mtn')).toBeInTheDocument()
  })

  it('prefills bank when user has bank_accounts', () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: {
        bank_accounts: [
          {
            bank_name: 'Test Bank',
            account_number: '123',
            bank_branch: 'Branch',
            account_holder_name: 'Holder',
            swift_code: 'SWIFT',
          },
        ],
      },
    })
    renderWithProviders(<PaymentInfoForm />)
    expect(screen.getByText('Bank Account Details')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Bank Account' })).toHaveAttribute('data-state', 'checked')
  })
})
