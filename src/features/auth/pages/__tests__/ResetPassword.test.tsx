import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import ResetPassword from '../reset_password/ResetPassword'

vi.mock('../../hooks', () => ({
  useResetPasswordForm: () => ({
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
    email: null,
  }),
}))

describe('ResetPassword (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Create New Password heading', () => {
    const { getByRole } = renderWithProviders(<ResetPassword />)
    expect(getByRole('heading', { name: /create new password/i })).toBeInTheDocument()
  })

  it('renders Reset Password button', () => {
    const { getByRole } = renderWithProviders(<ResetPassword />)
    expect(getByRole('button', { name: /reset password/i })).toBeInTheDocument()
  })
})
