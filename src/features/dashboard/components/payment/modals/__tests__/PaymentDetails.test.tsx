import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PaymentDetails } from '../PaymentDetails'
import { MODALS } from '@/utils/constants'

const mockCloseModal = vi.fn()
const mockModalData = {
  status: 'completed',
  type: 'purchase',
  receipt_number: 'RCP-001',
  amount: 100,
  currency: 'GHS',
  trans_id: 'TXN-001',
  user_name: 'Test User',
  user_type: 'corporate',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
}

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: mockCloseModal,
    isModalOpen: (name: string) => name === MODALS.PAYMENT.VIEW,
    get modalData() {
      return mockModalData
    },
  }),
}))

describe('PaymentDetails (payment modal)', () => {
  it('renders modal with title when open', () => {
    renderWithProviders(<PaymentDetails />)
    expect(screen.getByText('Payment Details')).toBeInTheDocument()
  })

  it('renders Payment Information and detail rows', () => {
    renderWithProviders(<PaymentDetails />)
    expect(screen.getByText('Payment Information')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Receipt Number')).toBeInTheDocument()
    expect(screen.getByText('TXN-001')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('Close button calls closeModal', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PaymentDetails />)
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockCloseModal).toHaveBeenCalled()
  })

  it('renders fee breakdown when payment includes service_fee_amount and markup_amount', () => {
    Object.assign(mockModalData, {
      amount: 115.5,
      service_fee_amount: 5.5,
      markup_amount: 10,
      trans_id: 'TXN-002',
      receipt_number: 'RCP-002',
    })

    renderWithProviders(<PaymentDetails />)
    expect(screen.getByText('Total charged')).toBeInTheDocument()
    expect(screen.getByText('Items total')).toBeInTheDocument()
    expect(screen.getByText('Service fee')).toBeInTheDocument()
    expect(screen.getByText('Platform markup')).toBeInTheDocument()
  })
})
