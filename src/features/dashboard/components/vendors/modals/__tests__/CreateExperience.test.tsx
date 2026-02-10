import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import CreateExperience from '../CreateExperience'
import { MODALS } from '@/utils/constants'

const mockOpenModal = vi.fn()
const mockCloseModal = vi.fn()
let isCreateExperienceOpen = false
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    usePersistedModalState: () => ({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      isModalOpen: (name: string) => name === MODALS.EXPERIENCE.CREATE && isCreateExperienceOpen,
    }),
  }
})

vi.mock('../../forms', () => ({
  CreateExperienceForm: () => <div data-testid="create-experience-form">CreateExperienceForm</div>,
}))

describe('CreateExperience (vendor modal)', () => {
  beforeEach(() => {
    isCreateExperienceOpen = false
  })

  it('renders Create Experience button', () => {
    renderWithProviders(<CreateExperience />)
    expect(screen.getByRole('button', { name: /create experience/i })).toBeInTheDocument()
  })

  it('opens modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateExperience />)
    await user.click(screen.getByRole('button', { name: /create experience/i }))
    expect(mockOpenModal).toHaveBeenCalledWith(MODALS.EXPERIENCE.CREATE)
  })

  it('when modal is open, shows Create experience title and form', () => {
    isCreateExperienceOpen = true
    renderWithProviders(<CreateExperience />)
    expect(screen.getAllByText(/create experience/i).length).toBeGreaterThan(0)
    expect(screen.getByTestId('create-experience-form')).toBeInTheDocument()
  })
})
