import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import AcceptBranchManagerInvite from '../acceptBranchManagerInvite/AcceptBranchManagerInvite'

vi.mock('../../hooks', () => ({
  useAcceptBranchManagerForm: () => ({
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
    hasValidToken: true,
  }),
}))

describe('AcceptBranchManagerInvite (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Accept Branch Manager Invitation heading when token valid', () => {
    const { getByRole } = renderWithProviders(<AcceptBranchManagerInvite />)
    expect(getByRole('heading', { name: /accept branch manager invitation/i })).toBeInTheDocument()
  })
})
