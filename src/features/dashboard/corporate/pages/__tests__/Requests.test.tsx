import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Requests from '../requests/Requests'

vi.mock('@/features/dashboard/hooks', () => ({
  useCorporateRequests: () => ({
    query: {},
    requestCorporatesList: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoadingRequestCorporatesList: false,
    setQuery: vi.fn(),
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
  }),
}))

describe('Requests (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Requests title', () => {
    const { getAllByText } = renderWithProviders(<Requests />)
    expect(getAllByText('Requests').length).toBeGreaterThan(0)
  })
})
