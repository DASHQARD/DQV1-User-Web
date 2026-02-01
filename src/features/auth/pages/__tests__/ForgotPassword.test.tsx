import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import ForgotPassword from '../forgot_password/ForgotPassword'

describe('ForgotPassword page', () => {
  it('renders the forgot password form with heading', () => {
    const { getByRole } = renderWithProviders(<ForgotPassword />)

    expect(getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
  })

  it('renders send reset link button', () => {
    const { getByRole } = renderWithProviders(<ForgotPassword />)

    expect(getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('renders email input', () => {
    const { getByLabelText } = renderWithProviders(<ForgotPassword />)

    expect(getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders link to login', () => {
    const { getByRole } = renderWithProviders(<ForgotPassword />)

    expect(getByRole('link', { name: /login/i })).toBeInTheDocument()
  })
})
