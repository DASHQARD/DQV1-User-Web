import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ApproveAction } from '../ApproveAction'

const mockCloseModal = vi.fn()
let isApproveOpen = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: mockCloseModal,
    isModalOpen: () => isApproveOpen,
    modalData: { id: 1, request_id: 'REQ-001' },
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useUpdateRequestStatusService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('ApproveAction (corporate modal)', () => {
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
})
