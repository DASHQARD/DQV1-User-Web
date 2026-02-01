import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import ResetPassword from '../reset_password/ResetPassword'

describe('ResetPassword page', () => {
  it('renders the reset password form with heading', () => {
    const { getByRole } = renderWithProviders(<ResetPassword />)

    expect(getByRole('heading', { name: /create new password/i })).toBeInTheDocument()
  })

  it('renders new password and confirm password inputs', () => {
    const { getByPlaceholderText } = renderWithProviders(<ResetPassword />)

    expect(getByPlaceholderText(/enter your new password/i)).toBeInTheDocument()
    expect(getByPlaceholderText(/confirm your new password/i)).toBeInTheDocument()
  })

  it('renders reset password button', () => {
    const { getByRole } = renderWithProviders(<ResetPassword />)

    expect(getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })
})
