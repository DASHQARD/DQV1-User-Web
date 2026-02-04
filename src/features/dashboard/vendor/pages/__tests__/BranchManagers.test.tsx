import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import BranchManagers from '../branchManagers/BranchManagers'

vi.mock('../branchManagers/useBranchManagers', () => ({
  useBranchManagers: () => ({
    query: {},
    setQuery: vi.fn(),
    isCorporateSuperAdmin: false,
    invitations: [],
    isLoadingInvitations: false,
    pagination: { hasNextPage: false, hasPreviousPage: false, previous: undefined },
    handleNextPage: vi.fn(),
    handleSetAfter: vi.fn(),
    estimatedTotal: 0,
    openInviteModal: vi.fn(),
  }),
}))

describe('BranchManagers (vendor)', () => {
  it('renders Branch Managers Invitations heading', () => {
    renderWithProviders(<BranchManagers />)
    expect(screen.getByText('Branch Managers Invitations')).toBeInTheDocument()
  })

  it('renders search placeholder', () => {
    renderWithProviders(<BranchManagers />)
    expect(screen.getByPlaceholderText(/search by email or name/i)).toBeInTheDocument()
  })
})
