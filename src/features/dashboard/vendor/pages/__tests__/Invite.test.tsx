import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Invite from '../invite/Invite'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useLocation: () => ({ pathname: '/vendor/invite' }),
  }
})

vi.mock('../branches', () => ({
  CreateBranch: () => <div data-testid="create-branch">Create Branch</div>,
  BranchDetails: () => null,
  BranchHome: () => null,
}))

vi.mock('../invite/InviteAdmin', () => ({
  InviteAdmin: () => <div data-testid="invite-admin">Invite Admin form</div>,
}))

describe('Invite (vendor)', () => {
  it('renders Branches & Admin heading', () => {
    renderWithProviders(<Invite />)
    expect(screen.getByText('Branches & Admin')).toBeInTheDocument()
  })

  it('renders tabbed view with Create Branch and Invite Admin tabs', () => {
    renderWithProviders(<Invite />)
    expect(screen.getByRole('button', { name: /create branch/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /invite admin/i })).toBeInTheDocument()
  })

  it('renders Create Branch content by default', () => {
    renderWithProviders(<Invite />)
    expect(screen.getByTestId('create-branch')).toBeInTheDocument()
  })
})
