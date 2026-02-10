import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Transactions from '../transactions/Transactions'

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateQueries: () => ({
    useGetAllCorporatePaymentsService: vi.fn(() => ({
      data: { data: [], pagination: undefined },
      isLoading: false,
    })),
    useGetPaymentByIdService: () => ({ data: null, isLoading: false }),
  }),
}))

describe('Transactions (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Transactions title', () => {
    const { getAllByText } = renderWithProviders(<Transactions />)
    expect(getAllByText('Transactions').length).toBeGreaterThan(0)
  })

  it('renders All transactions section', () => {
    const { getByText } = renderWithProviders(<Transactions />)
    expect(getByText('All transactions')).toBeInTheDocument()
  })
})
