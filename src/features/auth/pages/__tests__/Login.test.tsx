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

vi.mock('@/features/website/components/GuestAddToCartModal', () => ({
  GuestAddToCartModal: () => null,
}))

vi.mock('@/stores', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores')>()
  return {
    ...actual,
    useGuestAddToCartModalStore: () => ({
      isOpen: false,
      pendingItem: null,
      open: vi.fn(),
      close: vi.fn(),
    }),
  }
})

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
