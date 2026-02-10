import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { DeleteAdminInvitiationAction } from '../DeleteAdminInvitiationAction'
import { MODALS } from '@/utils/constants'

let isDeleteInvitationOpen = false
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    isModalOpen: () => isDeleteInvitationOpen,
    modalData: { id: 'inv-1' },
  }),
}))

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useDeleteCorporateAdminInvitationService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('DeleteAdminInvitiationAction (corporate modal)', () => {
  it('when modal is open, shows Delete Invitation title and message', () => {
    isDeleteInvitationOpen = true
    renderWithProviders(<DeleteAdminInvitiationAction />)
    expect(screen.getByText('Delete Invitation')).toBeInTheDocument()
    expect(
      screen.getByText(/Are you sure you want to delete this invitation\?/i),
    ).toBeInTheDocument()
  })

  it('renders Cancel and Delete buttons', () => {
    isDeleteInvitationOpen = true
    renderWithProviders(<DeleteAdminInvitiationAction />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
