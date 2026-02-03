import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import { OTPInput } from '../OTPInput/OTPInput'

describe('OTPInput', () => {
  it('renders correct number of inputs by default', () => {
    const onChange = vi.fn()
    renderWithProviders(<OTPInput onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(6)
  })

  it('renders custom length when length prop is provided', () => {
    const onChange = vi.fn()
    renderWithProviders(<OTPInput length={4} onChange={onChange} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(4)
  })

  it('calls onChange when user types a digit', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<OTPInput onChange={onChange} />)
    const firstInput = screen.getByTestId('input-0')
    await user.type(firstInput, '5')
    expect(onChange).toHaveBeenCalledWith('5')
  })

  it('does not call onChange when user types non-numeric', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<OTPInput onChange={onChange} />)
    const firstInput = screen.getByTestId('input-0')
    await user.type(firstInput, 'a')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('displays error when error prop is provided', () => {
    const onChange = vi.fn()
    renderWithProviders(<OTPInput onChange={onChange} error="Invalid OTP" />)
    expect(screen.getByText('Invalid OTP')).toBeInTheDocument()
  })

  it('pre-fills value from value prop', () => {
    const onChange = vi.fn()
    renderWithProviders(<OTPInput value="12" onChange={onChange} length={6} />)
    expect(screen.getByTestId('input-0')).toHaveValue('1')
    expect(screen.getByTestId('input-1')).toHaveValue('2')
    expect(screen.getByTestId('input-2')).toHaveValue('')
  })

  it('masks value when secure is true', () => {
    const onChange = vi.fn()
    renderWithProviders(<OTPInput value="123456" onChange={onChange} secure />)
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach((input) => {
      expect(input.value === '' || input.value === '*').toBe(true)
    })
  })

  it('moves focus to next input when digit is entered', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<OTPInput onChange={onChange} />)
    const firstInput = screen.getByTestId('input-0')
    await user.type(firstInput, '1')
    const secondInput = screen.getByTestId('input-1')
    expect(document.activeElement).toBe(secondInput)
  })

  it('accepts paste of full OTP', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderWithProviders(<OTPInput length={6} onChange={onChange} />)
    const firstInput = screen.getByTestId('input-0')
    await user.click(firstInput)
    await user.paste('123456')
    expect(onChange).toHaveBeenCalledWith('123456')
  })
})
