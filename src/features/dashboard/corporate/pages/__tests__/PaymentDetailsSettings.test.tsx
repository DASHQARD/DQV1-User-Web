import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { PaymentDetailsSettings } from '../settings/PaymentDetailsSettings'

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

vi.mock('../settings/usePaymentDetailsSettings', async () => {
  const { useForm } = await import('react-hook-form')
  return {
    usePaymentDetailsSettings: () => {
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
        form,
        onSubmit: vi.fn(),
        handleDelete: vi.fn(),
        isUpdating: false,
        isDeleting: false,
        hasPaymentDetails: false,
        paymentMethod: 'mobile_money',
        mobileMoneyProviders: [],
        bankOptions: [],
        countries: [],
        isDeleteModalOpen: false,
        setIsDeleteModalOpen: vi.fn(),
      }
    },
  }
})

describe('PaymentDetailsSettings (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Payment Method section', () => {
    const { getByText } = renderWithProviders(<PaymentDetailsSettings />)
    expect(getByText('Payment Method')).toBeInTheDocument()
  })

  it('renders Mobile Money and Bank Account options', () => {
    const { getByLabelText } = renderWithProviders(<PaymentDetailsSettings />)
    expect(getByLabelText(/mobile money/i)).toBeInTheDocument()
    expect(getByLabelText(/bank account/i)).toBeInTheDocument()
  })
})
