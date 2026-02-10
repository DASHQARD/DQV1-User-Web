import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import RecentAuditLogs from '../RecentAuditLogs'

const mockUseGetAuditLogsCorporateService = vi.fn()
vi.mock('@/features/dashboard/corporate', () => ({
  corporateQueries: () => ({
    useGetAuditLogsCorporateService: mockUseGetAuditLogsCorporateService,
  }),
}))

describe('RecentAuditLogs', () => {
  beforeEach(() => {
    mockUseGetAuditLogsCorporateService.mockReturnValue({
      data: undefined,
      isLoading: false,
    })
  })

  it('renders title and View all link', () => {
    mockUseGetAuditLogsCorporateService.mockReturnValue({ data: { data: [] }, isLoading: false })
    renderWithProviders(<RecentAuditLogs />)
    expect(screen.getByRole('heading', { name: 'Audit Logs' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View all/i })).toHaveAttribute(
      'href',
      expect.stringContaining('audit-logs'),
    )
  })

  it('shows loading state', () => {
    mockUseGetAuditLogsCorporateService.mockReturnValue({ data: undefined, isLoading: true })
    renderWithProviders(<RecentAuditLogs />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty state when no audit logs', () => {
    mockUseGetAuditLogsCorporateService.mockReturnValue({ data: { data: [] }, isLoading: false })
    renderWithProviders(<RecentAuditLogs />)
    expect(screen.getByText('No audit logs to display')).toBeInTheDocument()
  })

  it('renders recent activities when data is present', () => {
    mockUseGetAuditLogsCorporateService.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            name: 'Admin User',
            user_type: 'admin',
            action: 'CREATE_RECIPIENT',
            description: 'Created a new recipient',
            created_at: '2025-01-15T10:30:00Z',
          },
        ],
      },
      isLoading: false,
    })
    renderWithProviders(<RecentAuditLogs />)
    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
    expect(screen.getByText('Created A New Recipient')).toBeInTheDocument()
  })
})
