import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import VendorInvitations from '../vendorInvitations/VendorInvitations'

vi.mock('@/features/dashboard/hooks', () => ({
  useVendorInvitations: () => ({
    query: {},
    invitationList: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoading: false,
    setQuery: vi.fn(),
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
  }),
}))

describe('VendorInvitations (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Vendor Invitations title', () => {
    const { getAllByText } = renderWithProviders(<VendorInvitations />)
    expect(getAllByText('Vendor Invitations').length).toBeGreaterThan(0)
  })
})
