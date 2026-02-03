import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import ResendCode from '../ResendCode/ResendCode'

describe('ResendCode', () => {
  it('renders "Resend code" button when countdown is null', () => {
    const onResend = vi.fn()
    renderWithProviders(
      <ResendCode countdown={null} formatCountdown={(n) => `${n}s`} onResend={onResend} />,
    )
    expect(screen.getByText(/Didn't get a code?/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument()
  })

  it('calls onResend when Resend code is clicked', async () => {
    const user = userEvent.setup()
    const onResend = vi.fn()
    renderWithProviders(
      <ResendCode countdown={null} formatCountdown={(n) => `${n}s`} onResend={onResend} />,
    )
    await user.click(screen.getByRole('button', { name: /resend code/i }))
    expect(onResend).toHaveBeenCalledTimes(1)
  })

  it('shows countdown text when countdown is set', () => {
    renderWithProviders(
      <ResendCode countdown={60} formatCountdown={(n) => `${n}s`} onResend={() => {}} />,
    )
    expect(screen.getByText('Resend in 60s')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /resend code/i })).not.toBeInTheDocument()
  })

  it('disables button when isLoading', () => {
    renderWithProviders(
      <ResendCode
        countdown={null}
        formatCountdown={(n) => `${n}s`}
        onResend={() => {}}
        isLoading
      />,
    )
    expect(screen.getByRole('button', { name: /resend code/i })).toBeDisabled()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <ResendCode
        countdown={null}
        formatCountdown={(n) => `${n}s`}
        onResend={() => {}}
        className="custom-class"
      />,
    )
    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })
})
