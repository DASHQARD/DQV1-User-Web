import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { MobileSwitchWorkspace } from '../MobileSwitchWorkspace'
import { ROUTES } from '@/utils/constants'

const mockNavigate = vi.fn()
const mockSetSearchParams = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('account=corporate'), mockSetSearchParams],
  }
})

const mockUseGetUserProfileService = vi.fn()
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: mockUseGetUserProfileService,
    }),
    useBusinessLogoUrl: () => ({ url: null }),
  }
})

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetAllVendorsManagementService: () => ({
      data: {
        data: [
          {
            vendor_id: '019eb501-f5dd-7c95-b770-e0c5559cf03c',
            vendor_name: 'Marvel',
            gvid: '0493-01',
            approval_status: 'approved',
            status: 'active',
          },
        ],
      },
    }),
  }),
}))

describe('MobileSwitchWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGetUserProfileService.mockReturnValue({
      data: {
        user_type: 'corporate super admin',
        business_details: [{ name: 'Marvel Corp' }],
      },
    })
  })

  it('renders Switch Workspace with vendor list for corporate super admin', () => {
    renderWithProviders(<MobileSwitchWorkspace />)
    expect(screen.getByText('Switch Workspace')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Marvel/i })).toBeInTheDocument()
  })

  it('navigates to vendor home when a vendor is selected', async () => {
    const user = userEvent.setup()
    const onAfterSwitch = vi.fn()
    renderWithProviders(<MobileSwitchWorkspace onAfterSwitch={onAfterSwitch} />)
    await user.click(screen.getByRole('button', { name: /Marvel/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor&vendor_id=019eb501-f5dd-7c95-b770-e0c5559cf03c`,
    )
    expect(onAfterSwitch).toHaveBeenCalled()
  })

  it('renders nothing for non-super-admin users', () => {
    mockUseGetUserProfileService.mockReturnValue({
      data: { user_type: 'corporate' },
    })
    renderWithProviders(<MobileSwitchWorkspace />)
    expect(screen.queryByText('Switch Workspace')).not.toBeInTheDocument()
  })
})
