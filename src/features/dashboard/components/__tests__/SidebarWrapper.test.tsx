import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import { useAuthStore } from '@/stores'
import SidebarWrapper from '../Sidebar'

vi.mock('@/stores', () => ({ useAuthStore: vi.fn() }))

vi.mock('../sidebar/BranchSidebar', () => ({
  default: () => <div data-testid="branch-sidebar">Branch</div>,
}))
vi.mock('../sidebar/CorporateSidebar', () => ({
  default: () => <div data-testid="corporate-sidebar">Corporate</div>,
}))
vi.mock('../sidebar/CorporateVendorSidebar', () => ({
  default: () => <div data-testid="corporate-vendor-sidebar">CorporateVendor</div>,
}))
vi.mock('../sidebar/VendorSidebar', () => ({
  default: () => <div data-testid="vendor-sidebar">Vendor</div>,
}))
vi.mock('../sidebar/UserSidebar', () => ({
  default: () => <div data-testid="user-sidebar">User</div>,
}))

describe('Sidebar (wrapper)', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
    } as any)
  })

  it('renders UserSidebar for regular user (no user_type)', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { user_type: 'user' },
    } as any)
    renderWithProviders(<SidebarWrapper />)
    expect(screen.getByTestId('user-sidebar')).toBeInTheDocument()
  })

  it('renders BranchSidebar when user_type is branch', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { user_type: 'branch' },
    } as any)
    renderWithProviders(<SidebarWrapper />)
    expect(screen.getByTestId('branch-sidebar')).toBeInTheDocument()
  })

  it('renders CorporateSidebar when account=corporate in URL', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { user_type: 'corporate' },
    } as any)
    renderWithProviders(<SidebarWrapper />, {
      initialEntries: ['/dashboard?account=corporate'],
    })
    expect(screen.getByTestId('corporate-sidebar')).toBeInTheDocument()
  })

  it('renders VendorSidebar when user_type is vendor and account=vendor', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { user_type: 'vendor' },
    } as any)
    renderWithProviders(<SidebarWrapper />, {
      initialEntries: ['/dashboard?account=vendor'],
    })
    expect(screen.getByTestId('vendor-sidebar')).toBeInTheDocument()
  })
})
