import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Login from '../login/Login'

vi.mock('../../hooks', () => ({
  useLoginForm: () => ({
    form: {
      handleSubmit: (fn: () => void) => (e: React.FormEvent) => {
        e.preventDefault()
        fn()
      },
      register: () => ({}),
      formState: { errors: {}, isValid: true },
    },
    onSubmit: vi.fn(),
    isPending: false,
    modal: {
      modalState: null,
      isModalOpen: vi.fn(() => false),
      closeModal: vi.fn(),
      openModal: vi.fn(),
    },
  }),
}))

describe('Login (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Welcome Back heading', () => {
    const { getByRole } = renderWithProviders(<Login />)
    expect(getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('renders Sign In button', () => {
    const { getByRole } = renderWithProviders(<Login />)
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
