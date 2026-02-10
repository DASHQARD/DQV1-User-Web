import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import RecentRequests from '../RecentRequests'

vi.mock('@/stores', () => ({
  useAuthStore: () => ({ user: { user_type: 'corporate' } }),
}))

const mockUseGetRequestsCorporateService = vi.fn()
const mockUseGetRequestsCorporateSuperAdminVendorService = vi.fn()
vi.mock('@/features/dashboard/corporate', () => ({
  corporateQueries: () => ({
    useGetRequestsCorporateService: mockUseGetRequestsCorporateService,
    useGetRequestsCorporateSuperAdminVendorService:
      mockUseGetRequestsCorporateSuperAdminVendorService,
  }),
}))

describe('RecentRequests', () => {
  beforeEach(() => {
    mockUseGetRequestsCorporateService.mockReturnValue({ data: [] })
    mockUseGetRequestsCorporateSuperAdminVendorService.mockReturnValue({ data: [] })
  })

  it('renders title and View all link', () => {
    renderWithProviders(<RecentRequests />)
    expect(screen.getByRole('heading', { name: 'Requests' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View all/i })).toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    renderWithProviders(<RecentRequests />)
    expect(screen.getByText('No requests to display')).toBeInTheDocument()
  })

  it('renders request list when data is present', () => {
    mockUseGetRequestsCorporateService.mockReturnValue({
      data: [
        {
          id: 1,
          request_id: 'RQ-001',
          type: 'Vendor Onboarding',
          status: 'pending',
          description: 'New vendor request',
          name: 'Acme Corp',
          created_at: '2025-01-15T10:00:00Z',
        },
      ],
    })
    renderWithProviders(<RecentRequests />)
    expect(screen.getByText('RQ-001')).toBeInTheDocument()
    expect(screen.getByText('Vendor Onboarding')).toBeInTheDocument()
    expect(screen.getByText('New vendor request')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })
})
