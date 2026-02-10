import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Purchase from '../purchase/Purchase'

vi.mock('@/features/dashboard/hooks', () => ({
  usePurchaseManagement: () => ({
    purchaseTabConfig: [{ id: 'bulk', label: 'Bulk Purchase' }],
    currentTab: 'bulk',
    handleBulkPurchase: vi.fn(),
    query: {},
    setQuery: vi.fn(),
    allCorporatePayments: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoading: false,
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
  }),
}))

describe('Purchase (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Purchases title', () => {
    const { getAllByText } = renderWithProviders(<Purchase />)
    expect(getAllByText('Purchases').length).toBeGreaterThan(0)
  })

  it('renders Bulk Purchase button', () => {
    const { getByRole } = renderWithProviders(<Purchase />)
    expect(getByRole('button', { name: /bulk purchase/i })).toBeInTheDocument()
  })

  it('renders All Purchases section', () => {
    const { getByText } = renderWithProviders(<Purchase />)
    expect(getByText('All Purchases')).toBeInTheDocument()
  })
})
