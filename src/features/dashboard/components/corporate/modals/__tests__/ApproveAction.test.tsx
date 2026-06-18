import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ApproveAction } from '../ApproveAction'
import { MODALS, ROUTES } from '@/utils/constants'

const mockNavigate = vi.fn()
const mockCloseModal = vi.fn()
const mockUpdateCorporate = vi.fn()
let isApproveOpen = false
let modalData: Record<string, unknown> = {
  id: 1,
  request_id: 'REQ-001',
  status: 'Awaiting Vendor Approval',
  current_approver_level: 'vendor_admin',
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: mockCloseModal,
    isModalOpen: () => isApproveOpen,
    modalData: modalData,
  }),
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: { user_type: 'corporate super admin' } }),
  }),
  useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useUpdateRequestStatusService: () => ({ mutate: mockUpdateCorporate, isPending: false }),
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks/useCorporateQueries', () => ({
  corporateQueries: () => ({
    useGetAllVendorsManagementService: () => ({
      data: {
        data: [{ vendor_id: 'v-7407', vendor_name: 'Marvel Universe Merch', gvid: '7407-01' }],
      },
    }),
  }),
}))

describe('ApproveAction (corporate modal)', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockCloseModal.mockReset()
    mockUpdateCorporate.mockReset()
    modalData = {
      id: 1,
      request_id: 'REQ-001',
      status: 'Awaiting Vendor Approval',
      current_approver_level: 'vendor_admin',
    }
  })

  it('when modal is open, shows Approve Request title and message', () => {
    isApproveOpen = true
    renderWithProviders(<ApproveAction />)
    expect(screen.getByText('Approve Request')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to approve this request\?/i)).toBeInTheDocument()
  })

  it('renders Cancel and Approve buttons', () => {
    isApproveOpen = true
    renderWithProviders(<ApproveAction />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })

  it('Cancel button calls closeModal', async () => {
    isApproveOpen = true
    const user = userEvent.setup()
    renderWithProviders(<ApproveAction />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockCloseModal).toHaveBeenCalled()
  })

  it('redirects vendor-level approvals to vendor Requests page', async () => {
    isApproveOpen = true
    const user = userEvent.setup()
    renderWithProviders(<ApproveAction />)
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(mockCloseModal).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS),
    )
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining(`${MODALS.REQUEST.PARAM_NAME}=${MODALS.REQUEST.CHILDREN.APPROVE}`),
    )
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('vendor_id=v-7407'))
  })

  it('uses corporate update-status when current level is corporate_admin', async () => {
    modalData = {
      id: 1,
      request_id: 'REQ-002',
      status: 'Awaiting Corporate Approval',
      current_approver_level: 'corporate_admin',
    }
    isApproveOpen = true
    const user = userEvent.setup()
    renderWithProviders(<ApproveAction />)
    await user.click(screen.getByRole('button', { name: 'Approve' }))
    expect(mockUpdateCorporate).toHaveBeenCalledWith(
      { id: '1', status: 'approved' },
      expect.any(Object),
    )
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
