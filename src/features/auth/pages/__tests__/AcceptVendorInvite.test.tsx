import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AcceptVendorInvite from '../acceptVendorInvite/AcceptVendorInvite'

vi.mock('../../hooks', () => ({
  useAcceptVendorAdminForm: () => ({
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

describe('AcceptVendorInvite (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Set Your Password heading', () => {
    const { getByRole } = renderWithProviders(<AcceptVendorInvite />)
    expect(getByRole('heading', { name: /set your password/i })).toBeInTheDocument()
  })

  it('renders Accept Invitation button', () => {
    const { getByRole } = renderWithProviders(<AcceptVendorInvite />)
    expect(getByRole('button', { name: /accept invitation/i })).toBeInTheDocument()
  })
})
