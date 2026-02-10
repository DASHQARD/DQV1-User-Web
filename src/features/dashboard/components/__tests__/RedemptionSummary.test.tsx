import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import RedemptionSummary from '../RedemptionSummary'

describe('RedemptionSummary', () => {
  it('renders modal with title and success message when open', () => {
    renderWithProviders(
      <RedemptionSummary isOpen onClose={vi.fn()} />,
    )
    expect(screen.getByRole('heading', { name: 'Redemption Summary' })).toBeInTheDocument()
    expect(screen.getByText(/Your redemption request has been submitted successfully/)).toBeInTheDocument()
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('shows Registered User when isRegisteredUser is true', () => {
    renderWithProviders(
      <RedemptionSummary isOpen onClose={vi.fn()} isRegisteredUser />,
    )
    expect(screen.getByText('Registered User')).toBeInTheDocument()
  })

  it('shows Guest when isRegisteredUser is false', () => {
    renderWithProviders(
      <RedemptionSummary isOpen onClose={vi.fn()} isRegisteredUser={false} />,
    )
    expect(screen.getByText('Guest')).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <RedemptionSummary isOpen onClose={onClose} />,
    )
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('does not render modal content when isOpen is false', () => {
    renderWithProviders(
      <RedemptionSummary isOpen={false} onClose={vi.fn()} />,
    )
    expect(screen.queryByRole('heading', { name: 'Redemption Summary' })).not.toBeInTheDocument()
  })
})
