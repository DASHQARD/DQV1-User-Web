import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import SignUp from '../sign_up/SignUp'

describe('SignUp page', () => {
  it('renders the sign up form with heading and create account button', () => {
    const { getByRole } = renderWithProviders(<SignUp />)

    expect(getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('renders email, phone and password inputs', () => {
    const { getByPlaceholderText } = renderWithProviders(<SignUp />)

    expect(getByPlaceholderText(/enter your email/i)).toBeInTheDocument()
    expect(getByPlaceholderText(/enter number/i)).toBeInTheDocument()
    expect(getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })

  it('renders link to login', () => {
    const { getByRole } = renderWithProviders(<SignUp />)

    expect(getByRole('link', { name: /login/i })).toBeInTheDocument()
  })
})
