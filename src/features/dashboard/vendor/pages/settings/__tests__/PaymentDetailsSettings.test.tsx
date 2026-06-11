import { describe, it, expect, vi, beforeAll } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PaymentDetailsSettings } from '../PaymentDetailsSettings'

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

vi.mock('@/features/dashboard/vendor/hooks', async () => {
  const { useForm } = await vi.importActual<typeof import('react-hook-form')>('react-hook-form')
  return {
    usePaymentDetailsSettingsForm: () => {
      const form = useForm({
        defaultValues: {
          payment_method: 'mobile_money',
          mobile_money_provider: '',
          mobile_money_number: '',
          bank_name: '',
          branch: '',
          account_name: '',
          account_number: '',
          swift_code: '',
          sort_code: '',
        },
      })
      return {
        canManagePayment: true,
        form,
        paymentMethod: 'mobile_money' as const,
        mobileMoneyProviders: [{ label: 'MTN', value: 'mtn' }],
        bankOptions: [{ label: 'Bank A', value: 'bank_a' }],
        phoneCountries: [],
        onSubmit: vi.fn(),
        isPending: false,
        momoLookup: { isResolving: false, accountName: null, error: null },
        bankLookup: { isResolving: false, accountName: null, error: null },
        handleBankSelect: vi.fn(),
        selectedBankCode: '',
      }
    },
  }
})

describe('PaymentDetailsSettings (vendor)', () => {
  it('renders Payment Method section', () => {
    renderWithProviders(<PaymentDetailsSettings />)
    expect(screen.getByText('Payment Method')).toBeInTheDocument()
    expect(screen.getByLabelText(/mobile money/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/bank account/i)).toBeInTheDocument()
  })

  it('renders Add Payment Details button', () => {
    renderWithProviders(<PaymentDetailsSettings />)
    expect(screen.getByRole('button', { name: /add payment details/i })).toBeInTheDocument()
  })

  it('shows mobile money fields when payment method is mobile_money', () => {
    renderWithProviders(<PaymentDetailsSettings />)
    expect(screen.getByText(/mobile money provider/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter number eg\./i)).toBeInTheDocument()
  })
})
