import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Login from '../login/Login'

describe('Login page', () => {
  it('renders the login form with heading and sign in button', () => {
    const { getByRole } = renderWithProviders(<Login />)

    expect(getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    const { getByLabelText } = renderWithProviders(<Login />)

    expect(getByLabelText(/email/i)).toBeInTheDocument()
    expect(getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders link to forgot password', () => {
    const { getByRole } = renderWithProviders(<Login />)

    expect(getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
  })

  it('renders link to create account', () => {
    const { getByRole } = renderWithProviders(<Login />)

    expect(getByRole('link', { name: /create account/i })).toBeInTheDocument()
  })
})
