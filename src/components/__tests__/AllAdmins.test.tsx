import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AllAdmins from '@/features/dashboard/components/corporate/admins/AllAdmins'

vi.mock('@/features/dashboard/hooks', () => ({
  useCorporateAdmins: () => ({
    query: {},
    corporateAdminsList: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    modal: { modalState: null },
    isLoadingCorporateAdminsList: false,
    setQuery: vi.fn(),
    allAdminsHandleNextPage: vi.fn(),
    allAdminsHandleSetAfter: vi.fn(),
    allAdminsEstimatedTotal: 0,
  }),
}))

describe('AllAdmins (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders All Admins / print title', () => {
    const { getAllByText } = renderWithProviders(<AllAdmins />)
    expect(getAllByText(/all admins/i).length).toBeGreaterThan(0)
  })
})
