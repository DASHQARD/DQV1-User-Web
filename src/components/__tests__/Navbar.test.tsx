import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test/test-utils'
import Navbar from '../Navbar/Navbar'

vi.mock('@/stores', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
  useCartStore: () => ({
    isOpen: false,
    openCart: vi.fn(),
    closeCart: vi.fn(),
  }),
}))

vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: () => ({ data: null }),
  }),
  usePresignedURL: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetBranchesByVendorIdService: () => ({ data: null }),
  }),
}))

vi.mock('@/features/dashboard/branch', () => ({
  branchQueries: () => ({
    useGetBranchInfoService: () => ({ data: null }),
  }),
}))

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders logo', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByAltText('Logo')).toBeInTheDocument()
  })

  it('renders nav links when unauthenticated', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gift Cards' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vendors' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Redeem' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })

  it('renders Login and Register when not authenticated', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
  })

  it('renders cart and menu buttons', () => {
    renderWithProviders(<Navbar />)
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cart' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })
})
