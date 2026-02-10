import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { FloatingFeedbackButton } from '../floatingFeedbackButton/FloatingFeedbackButton'

vi.mock('@/services/feedback', () => ({
  submitFeedback: vi.fn().mockResolvedValue({ message: 'Thank you' }),
  createFeedbackPayload: vi.fn((data: any) => data),
}))

describe('FloatingFeedbackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders feedback trigger button', () => {
    renderWithProviders(<FloatingFeedbackButton />)
    expect(screen.getByRole('button', { name: /share your feedback/i })).toBeInTheDocument()
  })

  it('opens feedback modal when trigger is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FloatingFeedbackButton />)
    const trigger = screen.getByRole('button', { name: /share your feedback/i })
    await user.click(trigger)
    expect(screen.getByText('Share Your Feedback')).toBeInTheDocument()
    expect(screen.getByText('Bug Report')).toBeInTheDocument()
    expect(screen.getByText('Feedback Type *')).toBeInTheDocument()
  })
})
