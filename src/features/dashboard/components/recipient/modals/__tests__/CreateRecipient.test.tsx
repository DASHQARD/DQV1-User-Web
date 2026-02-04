import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { CreateRecipient } from '../CreateRecipient'

const mockOpenModal = vi.fn()
vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    openModal: mockOpenModal,
    closeModal: vi.fn(),
    isModalOpen: () => false,
  }),
}))

vi.mock('@/features/website', () => ({
  useRecipients: () => ({
    useCreateRecipientService: () => ({ mutate: vi.fn(), isPending: false }),
  }),
}))

describe('CreateRecipient (recipient modal)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Add Recipient button', () => {
    renderWithProviders(<CreateRecipient />)
    expect(screen.getByRole('button', { name: /add recipient/i })).toBeInTheDocument()
  })

  it('calls openModal when Add Recipient is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CreateRecipient />)
    await user.click(screen.getByRole('button', { name: /add recipient/i }))
    expect(mockOpenModal).toHaveBeenCalled()
  })
})
