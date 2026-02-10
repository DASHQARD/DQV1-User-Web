import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, screen } from '@/test/test-utils'
import BranchSidebar from '../BranchSidebar'

const mockSetIsCollapsed = vi.fn()
vi.mock('@/features/dashboard/branch', () => ({
  useBranchSidebar: () => ({
    navigate: vi.fn(),
    logout: vi.fn(),
    isCollapsed: false,
    setIsCollapsed: mockSetIsCollapsed,
    logoUrl: null,
    branchName: 'Test Branch',
    branchManagerName: 'Manager',
    branchLocation: 'Accra',
    discoveryScore: 50,
    canAccessExperienceAndRedemptions: true,
    isActive: (path: string) => path === '/dashboard/branch',
    addAccountParam: (path: string) => `${path}?account=branch`,
  }),
}))

describe('BranchSidebar', () => {
  it('renders sidebar with branch name and collapse button', () => {
    renderWithProviders(<BranchSidebar />)
    expect(screen.getByText('Test Branch')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it('toggles collapse when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<BranchSidebar />)
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(mockSetIsCollapsed).toHaveBeenCalledWith(true)
  })

  it('renders discovery score when not 100', () => {
    renderWithProviders(<BranchSidebar />)
    expect(screen.getByText('Discovery score')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders Log Out in footer', () => {
    renderWithProviders(<BranchSidebar />)
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument()
  })
})
