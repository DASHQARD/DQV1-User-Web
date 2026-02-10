import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { PurchaseDetails } from '../PurchaseDetails'

let isPurchaseViewOpen = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => isPurchaseViewOpen,
    modalData: { id: 1, trans_id: 'TXN-001' },
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetPaymentByIdService: () => ({
      data: {
        status: 'completed',
        trans_id: 'TXN-001',
        type: 'individual_purchase',
        amount: 100,
        currency: 'GHS',
      },
      isLoading: false,
    }),
  }),
}))

describe('PurchaseDetails (corporate modal)', () => {
  it('when modal is open, shows Purchase Details title and labels', () => {
    isPurchaseViewOpen = true
    renderWithProviders(<PurchaseDetails />)
    expect(screen.getByText('Purchase Details')).toBeInTheDocument()
    expect(screen.getAllByText('Transaction ID').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Purchase Type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Amount').length).toBeGreaterThan(0)
  })

  it('renders Cancel and Download PDF buttons', () => {
    isPurchaseViewOpen = true
    renderWithProviders(<PurchaseDetails />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Download PDF' })).toBeInTheDocument()
  })
})
