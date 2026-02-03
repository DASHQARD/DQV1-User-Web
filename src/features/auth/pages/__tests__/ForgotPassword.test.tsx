import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import ForgotPassword from '../forgot_password/ForgotPassword'

vi.mock('../../hooks', () => ({
  useForgotPasswordForm: () => ({
    form: {
      handleSubmit: (fn: () => void) => (e: React.FormEvent) => {
        e.preventDefault()
        fn()
      },
      register: () => ({}),
      formState: { errors: {} },
    },
    onSubmit: vi.fn(),
    isPending: false,
  }),
}))

describe('ForgotPassword (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Reset Password heading', () => {
    const { getByRole } = renderWithProviders(<ForgotPassword />)
    expect(getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
  })

  it('renders Send Reset Link button', () => {
    const { getByRole } = renderWithProviders(<ForgotPassword />)
    expect(getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })
})
