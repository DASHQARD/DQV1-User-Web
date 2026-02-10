import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Orders from '../orders/Orders'

vi.mock('@/features/dashboard/hooks', () => ({
  usePaymentInfoService: () => ({
    useGetPaymentByIdService: () => ({ data: [], isLoading: false }),
  }),
}))

describe('Orders (user)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Orders title', () => {
    const { getAllByText } = renderWithProviders(<Orders />)
    expect(getAllByText('Orders').length).toBeGreaterThan(0)
  })

  it('renders orders description', () => {
    const { getByText } = renderWithProviders(<Orders />)
    expect(getByText(/view and manage your.*orders/i)).toBeInTheDocument()
  })
})
