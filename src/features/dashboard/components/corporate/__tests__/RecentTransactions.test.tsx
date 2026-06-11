import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import RecentTransactions from '../RecentTransactions'

const mockUseGetAllCorporatePaymentsService = vi.fn()
vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetAllCorporatePaymentsService: mockUseGetAllCorporatePaymentsService,
  }),
}))

describe('RecentTransactions', () => {
  beforeEach(() => {
    mockUseGetAllCorporatePaymentsService.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  it('renders title and View all link', () => {
    mockUseGetAllCorporatePaymentsService.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<RecentTransactions />)
    expect(screen.getByRole('heading', { name: 'Recent Transactions' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View all/i })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseGetAllCorporatePaymentsService.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<RecentTransactions />)
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument()
  })

  it('shows empty state when no transactions', () => {
    mockUseGetAllCorporatePaymentsService.mockReturnValue({ data: [], isLoading: false })
    renderWithProviders(<RecentTransactions />)
    expect(screen.getByText('No recent transactions to display')).toBeInTheDocument()
  })

  it('renders table when transactions exist', () => {
    mockUseGetAllCorporatePaymentsService.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            trans_id: 'TXN-001',
            receipt_number: '#DQI00836',
            type: 'purchase',
            amount: 100,
            status: 'completed',
            created_at: '2025-01-15T10:00:00Z',
          },
        ],
      },
      isLoading: false,
    })
    renderWithProviders(<RecentTransactions />)
    expect(screen.getByText('#DQI00836')).toBeInTheDocument()
    expect(screen.queryByText('TXN-001')).not.toBeInTheDocument()
    expect(screen.getByText('purchase')).toBeInTheDocument()
  })
})
