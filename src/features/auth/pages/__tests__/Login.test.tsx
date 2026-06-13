import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders, screen } from '@/test/test-utils'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import Login from '../login/Login'

vi.mock('../../hooks', () => ({
  useLoginForm: () => ({
    form: {
      handleSubmit: (fn: () => void) => (e: React.FormEvent) => {
        e.preventDefault()
        fn()
      },
      register: () => ({}),
      formState: { errors: {}, isValid: true, touchedFields: {}, submitCount: 0 },
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
    useAuthStore.getState().reset()
  })

  it('renders Welcome Back heading', () => {
    const { getByRole } = renderWithProviders(<Login />)
    expect(getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('renders Sign In button', () => {
    const { getByRole } = renderWithProviders(<Login />)
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects signed-in members to the dashboard', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuestAuth: false,
      token: 'member-token',
    })

    const { container } = renderWithProviders(<Login />, {
      initialEntries: [ROUTES.IN_APP.AUTH.LOGIN],
    })

    expect(container.querySelector('form')).not.toBeInTheDocument()
  })

  it('shows login form for guest browse sessions', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuestAuth: true,
      token: 'guest-token',
    })

    const { getByRole } = renderWithProviders(<Login />, {
      initialEntries: [ROUTES.IN_APP.AUTH.LOGIN],
    })

    expect(getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('redirects legacy verification links before checking member session', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuestAuth: false,
      token: 'member-token',
    })

    renderWithProviders(
      <Routes>
        <Route path={ROUTES.IN_APP.AUTH.LOGIN} element={<Login />} />
        <Route path={ROUTES.IN_APP.AUTH.VERIFY_EMAIL} element={<div>Verify email page</div>} />
      </Routes>,
      { initialEntries: [`${ROUTES.IN_APP.AUTH.LOGIN}?vtoken=legacy-token`] },
    )

    expect(screen.getByText('Verify email page')).toBeInTheDocument()
  })
})
