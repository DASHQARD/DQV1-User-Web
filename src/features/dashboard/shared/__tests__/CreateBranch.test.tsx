import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CreateBranch from '../CreateBranch'
import { MODALS } from '@/utils/constants'

const mockOpenModal = vi.fn()
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: mockOpenModal,
    closeModal: vi.fn(),
    isModalOpen: vi.fn(),
  }),
}))

vi.mock('@/features/dashboard/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/dashboard/components')>()
  return {
    ...actual,
    AddBranchForm: () => <div data-testid="add-branch-form">AddBranchForm</div>,
  }
})

describe('CreateBranch (dashboard shared)', () => {
  it('renders Create branch button', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByRole('button', { name: /create branch/i })).toBeInTheDocument()
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateBranch />)
    await user.click(screen.getByRole('button', { name: /create branch/i }))
    expect(mockOpenModal).toHaveBeenCalledWith(MODALS.BRANCH.CREATE)
  })

  it('renders AddBranchForm', () => {
    renderWithProviders(<CreateBranch />)
    expect(screen.getByTestId('add-branch-form')).toBeInTheDocument()
  })
})
