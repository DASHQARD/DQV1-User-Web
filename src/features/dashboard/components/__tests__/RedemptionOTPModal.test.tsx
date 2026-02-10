import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import RedemptionOTPModal from '../RedemptionOTPModal'

describe('RedemptionOTPModal', () => {
  it('renders modal with title and message when open', () => {
    renderWithProviders(<RedemptionOTPModal isOpen onClose={vi.fn()} onVerify={vi.fn()} />)
    expect(screen.getByText('Verify Redemption')).toBeInTheDocument()
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument()
    expect(screen.getByText(/We've sent a verification code to/)).toBeInTheDocument()
    expect(screen.getByText('your phone number')).toBeInTheDocument()
  })

  it('displays userPhone when provided', () => {
    renderWithProviders(
      <RedemptionOTPModal
        isOpen
        onClose={vi.fn()}
        onVerify={vi.fn()}
        userPhone="+233 12 345 6789"
      />,
    )
    expect(screen.getByText('+233 12 345 6789')).toBeInTheDocument()
  })

  it('shows Security Notice and action buttons', () => {
    renderWithProviders(<RedemptionOTPModal isOpen onClose={vi.fn()} onVerify={vi.fn()} />)
    expect(screen.getByText('Security Notice')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verify & Confirm' })).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<RedemptionOTPModal isOpen onClose={onClose} onVerify={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onVerify with OTP when form is submitted with 4 digits', async () => {
    const onVerify = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<RedemptionOTPModal isOpen onClose={vi.fn()} onVerify={onVerify} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs.length).toBe(4)
    await user.type(inputs[0], '1')
    await user.type(inputs[1], '2')
    await user.type(inputs[2], '3')
    await user.type(inputs[3], '4')
    expect(onVerify).toHaveBeenCalledWith('1234')
  })

  it('does not render content when isOpen is false', () => {
    renderWithProviders(<RedemptionOTPModal isOpen={false} onClose={vi.fn()} onVerify={vi.fn()} />)
    expect(screen.queryByText('Verify Redemption')).not.toBeInTheDocument()
  })
})
