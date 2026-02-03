import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AuditLogs from '../AuditLogs'

vi.mock('../useAuditLogs', () => ({
  useAuditLogs: () => ({
    query: {},
    setQuery: vi.fn(),
    auditLogsData: [],
    pagination: { hasNextPage: false, hasPreviousPage: false },
    isLoading: false,
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
    auditLogsColumns: [],
    auditLogsCsvHeaders: [],
  }),
}))

describe('AuditLogs (corporate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Audit Logs title', () => {
    const { getAllByText } = renderWithProviders(<AuditLogs />)
    expect(getAllByText(/audit logs/i).length).toBeGreaterThan(0)
  })

  it('renders All audit logs tab', () => {
    const { getByText } = renderWithProviders(<AuditLogs />)
    expect(getByText(/all audit logs/i)).toBeInTheDocument()
  })
})
