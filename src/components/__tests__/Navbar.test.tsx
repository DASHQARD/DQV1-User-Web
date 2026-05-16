import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor, act } from '@testing-library/react'
import { renderWithProviders, screen } from '@/test/test-utils'
import Navbar from '../Navbar/Navbar'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'

const mockLogout = vi.fn()
const mockNavigate = vi.fn()
const mockOpenCart = vi.fn()
const mockCloseCart = vi.fn()

const cartStoreState = {
  isOpen: false,
  openCart: mockOpenCart,
  closeCart: mockCloseCart,
}

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(),
  useCartStore: () => cartStoreState,
  useGuestAddToCartModalStore: () => ({
    isOpen: false,
    pendingItem: null,
    open: vi.fn(),
    close: vi.fn(),
  }),
}))

const mockUseGetUserProfileService = vi.fn().mockReturnValue({ data: null })
const mockFetchPresignedURL = vi.fn()
vi.mock('@/hooks', () => ({
  useUserProfile: () => ({
    useGetUserProfileService: mockUseGetUserProfileService,
  }),
  usePresignedURL: () => ({ mutateAsync: mockFetchPresignedURL }),
  useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
}))

const mockUseGetBranchesByVendorIdService = vi.fn().mockReturnValue({ data: null })
const mockUseGetBranchInfoService = vi.fn().mockReturnValue({ data: null })
vi.mock('@/features', () => ({
  vendorQueries: () => ({
    useGetBranchesByVendorIdService: mockUseGetBranchesByVendorIdService,
  }),
}))

vi.mock('@/features/dashboard/branch', () => ({
  branchQueries: () => ({
    useGetBranchInfoService: mockUseGetBranchInfoService,
  }),
}))

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

describe('Navbar', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    } as any)
    cartStoreState.isOpen = false
    mockNavigate.mockClear()
    mockOpenCart.mockClear()
    mockCloseCart.mockClear()
    mockLogout.mockClear()
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

  describe('mobile menu', () => {
    it('opens mobile menu and shows nav items, Search, and Login/Register when not authenticated', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Menu' }))

      const mobileMenu = container.querySelector('.lg\\:hidden.border-t.border-gray-200.bg-white')
      expect(mobileMenu).toBeInTheDocument()

      expect(mobileMenu!.querySelector('a[href="/about"]')).toHaveTextContent('About')
      expect(mobileMenu!.querySelector('a[href="/dashqards"]')).toHaveTextContent('Gift Cards')
      expect(mobileMenu!.querySelector('a[href="/vendors"]')).toHaveTextContent('Vendors')
      expect(mobileMenu!.querySelector('a[href="/redeem"]')).toHaveTextContent('Redeem')
      expect(mobileMenu!.querySelector('a[href="/contact"]')).toHaveTextContent('Contact')

      const mobileSearch = mobileMenu!.querySelector('button')
      expect(mobileSearch).toHaveTextContent('Search')

      expect(mobileMenu!.querySelector('a[href="/auth/login"]')).toHaveTextContent('Login')
      expect(mobileMenu!.querySelector('a[href="/auth/register"]')).toHaveTextContent('Sign up')
    })

    it('shows Account section and Sign Out when authenticated', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Jane Doe', email: 'jane@example.com' },
        logout: mockLogout,
      } as any)
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Menu' }))

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    })

    it('mobile Search button navigates to DASHQARDS and closes menu', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Menu' }))
      const mobileMenu = container.querySelector('.lg\\:hidden.border-t.border-gray-200.bg-white')
      const mobileSearchBtn = mobileMenu!.querySelector('button')
      expect(mobileSearchBtn).toHaveTextContent('Search')
      await user.click(mobileSearchBtn!)
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.IN_APP.DASHQARDS)
      expect(
        container.querySelector('.lg\\:hidden.border-t.border-gray-200.bg-white'),
      ).not.toBeInTheDocument()
    })
  })

  describe('Search and Cart actions', () => {
    it('Search button navigates to DASHQARDS', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Search' }))
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.IN_APP.DASHQARDS)
    })

    it('Cart button calls openCart', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Cart' }))
      expect(mockOpenCart).toHaveBeenCalled()
    })
  })

  describe('authenticated account', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Jane Doe', email: 'jane@example.com' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({ data: null })
    })

    it('account menu item navigates and closes popover', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.IN_APP.DASHBOARD.HOME)
    })

    it('shows avatar fallback icon when no avatar URL', () => {
      renderWithProviders(<Navbar />)
      expect(screen.queryByRole('img', { name: 'Jane Doe' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    })

    it('shows avatar image when profile has avatar and presigned URL resolves', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: { avatar: 'avatar-key', user_type: 'user' },
      })
      mockFetchPresignedURL.mockResolvedValue('https://example.com/avatar.jpg')
      renderWithProviders(<Navbar />)
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument()
      })
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
        'src',
        'https://example.com/avatar.jpg',
      )
    })

    it('avatar img onError clears avatar URL and shows fallback', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: { avatar: 'avatar-key', user_type: 'user' },
      })
      mockFetchPresignedURL.mockResolvedValue('https://example.com/avatar.jpg')
      renderWithProviders(<Navbar />)
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument()
      })
      const img = screen.getByRole('img', { name: 'Jane Doe' })
      await act(async () => {
        img.dispatchEvent(new Event('error', { bubbles: true }))
      })
      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'Jane Doe' })).not.toBeInTheDocument()
      })
    })
  })

  describe('branch manager', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Branch User', email: 'branch@example.com', user_type: 'branch' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({ data: { user_type: 'branch' } })
      mockUseGetBranchInfoService.mockReturnValue({ data: null })
    })

    it('shows branch manager menu items (Dashboard, My Experience, Redemptions)', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'My Experience' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Redemptions' })).toBeInTheDocument()
    })

    it('branch manager Dashboard navigates to vendor home with account=vendor', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`,
      )
    })

    it('shows branch manager logo when businessDetails.logo is set', async () => {
      mockUseGetBranchInfoService.mockReturnValue({
        data: { business_details: { logo: 'branch-logo-key' } },
      })
      mockFetchPresignedURL.mockResolvedValue('https://example.com/branch-logo.png')
      renderWithProviders(<Navbar />)
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Branch User' })).toBeInTheDocument()
      })
      expect(screen.getByRole('img', { name: 'Branch User' })).toHaveAttribute(
        'src',
        'https://example.com/branch-logo.png',
      )
    })
  })

  describe('vendor', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Vendor User', email: 'vendor@example.com', user_type: 'vendor' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({
        data: { user_type: 'vendor', vendor_id: 10 },
      })
      mockUseGetBranchesByVendorIdService.mockReturnValue({ data: null })
    })

    it('shows vendor menu items (Dashboard, My Experience, Branches, Redemptions)', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'My Experience' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Branches' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Redemptions' })).toBeInTheDocument()
    })

    it('Branches navigates to listing when no firstBranch', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      await user.click(screen.getByRole('button', { name: 'Branches' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}?account=vendor`,
      )
    })

    it('Branches navigates to first branch path when firstBranch exists', async () => {
      mockUseGetBranchesByVendorIdService.mockReturnValue({
        data: [{ id: 99, branch_id: 99 }],
      })
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      await user.click(screen.getByRole('button', { name: 'Branches' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining(`${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/99`),
      )
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/account=vendor(&|$)/))
      expect(mockNavigate).toHaveBeenCalledWith(expect.stringMatching(/branch_id=99/))
    })

    it('shows vendor logo when business_documents has logo', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'vendor',
          vendor_id: 10,
          business_documents: [{ type: 'logo', file_url: 'vendor-logo-key' }],
        },
      })
      mockFetchPresignedURL.mockResolvedValue('https://example.com/vendor-logo.png')
      renderWithProviders(<Navbar />)
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Vendor User' })).toBeInTheDocument()
      })
      expect(screen.getByRole('img', { name: 'Vendor User' })).toHaveAttribute(
        'src',
        'https://example.com/vendor-logo.png',
      )
    })
  })

  describe('corporate', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Corp User', email: 'corp@example.com', user_type: 'corporate' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({
        data: { user_type: 'corporate', status: 'pending' },
      })
    })

    it('shows corporate menu items without Purchase/Requests when not approved', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Transactions' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Audit Logs' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Recipients' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Purchase' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Requests' })).not.toBeInTheDocument()
    })

    it('shows Purchase and Requests when status is approved', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: { user_type: 'corporate', status: 'approved' },
      })
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Purchase' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Requests' })).toBeInTheDocument()
    })

    it('shows Admins for corporate super admin when approved', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Super Admin', user_type: 'corporate super admin' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({
        data: { user_type: 'corporate super admin', status: 'approved' },
      })
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Admins' })).toBeInTheDocument()
    })

    it('corporate Dashboard navigates to corporate home with account=corporate', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      await user.click(screen.getByRole('button', { name: 'Dashboard' }))
      expect(mockNavigate).toHaveBeenCalledWith(
        `${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`,
      )
    })

    it('shows corporate logo when business_documents has logo', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'corporate',
          status: 'pending',
          business_documents: [{ type: 'logo', file_url: 'corp-logo-key' }],
        },
      })
      mockFetchPresignedURL.mockResolvedValue('https://example.com/corp-logo.png')
      renderWithProviders(<Navbar />)
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Corp User' })).toBeInTheDocument()
      })
      expect(screen.getByRole('img', { name: 'Corp User' })).toHaveAttribute(
        'src',
        'https://example.com/corp-logo.png',
      )
    })
  })
})
