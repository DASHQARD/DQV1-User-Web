import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import InviteCorporateAdmin from '../invitecorporateadmin/InviteCorporateAdmin'

vi.mock('@/features/dashboard/corporate', () => ({
  corporateMutations: () => ({
    useAcceptCorporateAdminInvitationService: () => ({
      mutate: vi.fn(),
      isPending: false,
    }),
  }),
}))

vi.mock('@/hooks', () => ({
  useToast: () => ({ error: vi.fn() }),
}))

describe('InviteCorporateAdmin (auth)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Set Your Password heading', () => {
    const { getByRole } = renderWithProviders(<InviteCorporateAdmin />)
    expect(getByRole('heading', { name: /set your password/i })).toBeInTheDocument()
  })
})
