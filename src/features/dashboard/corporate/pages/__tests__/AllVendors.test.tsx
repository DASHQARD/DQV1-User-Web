import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AllVendors from '../allVendors/AllVendors'

vi.mock('@/features/dashboard/hooks', () => ({
  useAllVendors: () => ({
    query: {},
    vendorList: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoading: false,
    setQuery: vi.fn(),
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
  }),
}))

describe('AllVendors (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders All Vendors title', () => {
    const { getAllByText } = renderWithProviders(<AllVendors />)
    expect(getAllByText(/all vendors/i).length).toBeGreaterThan(0)
  })
})
