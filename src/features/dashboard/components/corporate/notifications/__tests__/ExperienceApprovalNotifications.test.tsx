import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { ExperienceApprovalNotifications } from '../ExperienceApprovalNotifications'
import { MODALS } from '@/utils/constants'

const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
let isModalOpenState = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: mockOpenModal,
    closeModal: mockCloseModal,
    isModalOpen: () => isModalOpenState,
  }),
}))

vi.mock('@/features/dashboard/hooks/useExperienceApproval', () => ({
  useRejectExperience: () => ({ mutate: vi.fn(), isPending: false }),
}))

describe('ExperienceApprovalNotifications', () => {
  it('renders notification button with title', () => {
    renderWithProviders(<ExperienceApprovalNotifications />)
    expect(screen.getByTitle(/experience approval notifications/i)).toBeInTheDocument()
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ExperienceApprovalNotifications />)
    await user.click(screen.getByTitle(/experience approval notifications/i))
    expect(mockOpenModal).toHaveBeenCalledWith(
      MODALS.EXPERIENCE?.APPROVAL || 'experience-approval-notification',
    )
  })

  it('when modal is open, shows Experience Approval Requests content', () => {
    isModalOpenState = true
    renderWithProviders(<ExperienceApprovalNotifications />)
    expect(screen.getAllByText('Experience Approval Requests').length).toBeGreaterThan(0)
    expect(screen.getByText('No pending experience approval requests')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })
})
