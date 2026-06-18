import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { VendorRequestDetails } from '../VendorRequestDetails'
import { MODALS } from '@/utils/constants'

const mockUseVendorRequestDetails = vi.fn()

vi.mock('@/features/dashboard/vendor/hooks', () => ({
  useVendorRequestDetails: () => mockUseVendorRequestDetails(),
}))

vi.mock('../VendorApproveAction', () => ({ VendorApproveAction: () => null }))
vi.mock('../VendorRejectAction', () => ({ VendorRejectAction: () => null }))

describe('VendorRequestDetails', () => {
  it('hides approve/reject when request awaits corporate admin', () => {
    mockUseVendorRequestDetails.mockReturnValue({
      modal: {
        isModalOpen: (name?: string) => name === MODALS.REQUEST.CHILDREN.VIEW,
        closeModal: vi.fn(),
      },
      isPending: false,
      requestInfo: [{ label: 'Status', value: 'Awaiting Corporate Approval' }],
      data: {
        status: 'Awaiting Corporate Approval',
        current_approver_level: 'corporate_admin',
      },
      canApproveOrReject: false,
      approvalChain: [],
      awaitingApprovalNotice:
        'This request is awaiting corporate admin approval. You can view progress here; another role must approve it.',
      openApproveModal: vi.fn(),
      openRejectModal: vi.fn(),
    })

    renderWithProviders(<VendorRequestDetails />)

    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    expect(screen.getByText(/awaiting corporate admin approval/i)).toBeInTheDocument()
  })

  it('shows approve/reject when vendor admin is the current approver', () => {
    mockUseVendorRequestDetails.mockReturnValue({
      modal: {
        isModalOpen: (name?: string) => name === MODALS.REQUEST.CHILDREN.VIEW,
        closeModal: vi.fn(),
      },
      isPending: false,
      requestInfo: [{ label: 'Status', value: 'Awaiting Vendor Approval' }],
      data: {
        status: 'Awaiting Vendor Approval',
        current_approver_level: 'vendor_admin',
      },
      canApproveOrReject: true,
      approvalChain: [{ level: 'vendor_admin', status: 'pending' }],
      awaitingApprovalNotice: null,
      openApproveModal: vi.fn(),
      openRejectModal: vi.fn(),
    })

    renderWithProviders(<VendorRequestDetails />)

    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })
})
