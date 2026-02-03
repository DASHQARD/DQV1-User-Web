import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import EmailSentModal from '../EmailSentModal'
import { MODAL_NAMES } from '@/utils/constants'

vi.mock('@/hooks', () => ({
  usePersistedModalState: () => ({
    isModalOpen: (name: string) => name === MODAL_NAMES.AUTH.EMAIL_SENT,
    closeModal: vi.fn(),
    modalData: { email: 'test@example.com' },
  }),
}))

describe('EmailSentModal', () => {
  it('renders success content when open', () => {
    renderWithProviders(<EmailSentModal />)
    expect(screen.getByText('Registration Successful!')).toBeInTheDocument()
    expect(screen.getByText(/We've sent a verification link/)).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
