import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { TransactionDetails } from '../TransactionDetails'
import { MODALS } from '@/utils/constants'

let isTransactionViewOpen = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => isTransactionViewOpen,
    modalData: { id: 1 },
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetPaymentByIdService: () => ({
      data: {
        status: 'completed',
        id: 1,
        receipt_number: 'RCP-001',
        type: 'purchase',
        amount: 50,
        currency: 'GHS',
        user_name: 'Test User',
      },
      isLoading: false,
    }),
  }),
}))

describe('TransactionDetails (corporate modal)', () => {
  it('when modal is open, shows Transaction Details title and labels', () => {
    isTransactionViewOpen = true
    renderWithProviders(<TransactionDetails />)
    expect(screen.getByText('Transaction Details')).toBeInTheDocument()
    expect(screen.getAllByText('Transaction ID').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Receipt Number').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Transaction Type').length).toBeGreaterThan(0)
  })
})
