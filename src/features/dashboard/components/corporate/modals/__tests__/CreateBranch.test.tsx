import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CreateBranch from '../CreateBranch'
import { MODALS } from '@/utils/constants'

const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
let isCreateBranchOpen = false
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      isModalOpen: (name: string) => name === MODALS.BRANCH.CREATE && isCreateBranchOpen,
    }),
  }
})

vi.mock('../../forms', () => ({
  CreateBranchForm: () => <div data-testid="create-branch-form">CreateBranchForm</div>,
}))

describe('CreateBranch (corporate modal)', () => {
  beforeEach(() => {
    isCreateBranchOpen = false
  })

  it('renders Create branch button', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByRole('button', { name: 'Create branch' })).toBeInTheDocument()
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateBranch />)
    await user.click(screen.getByRole('button', { name: 'Create branch' }))
    expect(mockOpenModal).toHaveBeenCalledWith(MODALS.BRANCH.CREATE)
  })

  it('when modal is open, shows Branch Information and form', () => {
    isCreateBranchOpen = true
    renderWithProviders(<CreateBranch />)
    expect(screen.getByText('Branch Information')).toBeInTheDocument()
    expect(screen.getAllByText('Create branch').length).toBeGreaterThan(0)
    expect(screen.getByTestId('create-branch-form')).toBeInTheDocument()
  })
})
