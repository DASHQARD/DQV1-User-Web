import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { InviteAdmin } from '../InviteAdmin'
import { MODALS } from '@/utils/constants'

const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
let isInviteOpen = false
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      isModalOpen: (name: string) => name === MODALS.INVITE_ADMIN.CREATE && isInviteOpen,
    }),
    useCountriesData: () => ({ countries: [] }),
  }
})

vi.mock('@/features/dashboard/corporate/hooks', () => ({
  corporateMutations: () => ({
    useInviteAdminForCorporateService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('InviteAdmin (corporate modal)', () => {
  beforeEach(() => {
    isInviteOpen = false
  })

  it('renders Invite Admin button', () => {
    renderWithProviders(<InviteAdmin />)
    expect(screen.getByRole('button', { name: /invite admin/i })).toBeInTheDocument()
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<InviteAdmin />)
    await user.click(screen.getByRole('button', { name: /invite admin/i }))
    expect(mockOpenModal).toHaveBeenCalledWith(MODALS.INVITE_ADMIN.CREATE)
  })

  it('when modal is open, shows form with First Name, Last Name, Email', () => {
    isInviteOpen = true
    renderWithProviders(<InviteAdmin />)
    expect(screen.getAllByText('Invite Admin').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
  })
})
