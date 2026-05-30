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
vi.mock('@/utils/constants', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/constants')>()
  return {
    ...actual,
    ENV_VARS: { API_BASE_URL: 'https://api.example.com/api/v1' },
  }
})
vi.mock('@/hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks')>()
  return {
    ...actual,
    useUserProfile: () => ({
      useGetUserProfileService: mockUseGetUserProfileService,
    }),
    useToast: () => ({ toast: vi.fn(), success: vi.fn(), error: vi.fn() }),
  }
})

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

  it('highlights the active nav link for the current route', () => {
    renderWithProviders(<Navbar />, { initialEntries: ['/about'] })
    const aboutLink = screen.getByRole('link', { name: 'About' })
    const giftCardsLink = screen.getByRole('link', { name: 'Gift Cards' })

    expect(aboutLink).toHaveAttribute('aria-current', 'page')
    expect(aboutLink.className).toMatch(/text-primary-600/)
    expect(giftCardsLink).not.toHaveAttribute('aria-current', 'page')
  })

  it('highlights Vendors when on vendor profile route', () => {
    renderWithProviders(<Navbar />, { initialEntries: ['/vendor'] })
    expect(screen.getByRole('link', { name: 'Vendors' })).toHaveAttribute('aria-current', 'page')
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
    it('opens mobile menu and shows nav items and Login/Register when not authenticated', async () => {
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

    it('mobile Search button in navbar navigates to DASHQARDS', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Search' }))
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.IN_APP.DASHQARDS)
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

    it('shows default avatar image when no avatar URL', () => {
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute('src', expect.any(String))
      expect(screen.getByRole('button', { name: 'Account' })).toBeInTheDocument()
    })

    it('shows avatar image when profile has avatar storage key', () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: { avatar: 'avatar-key', user_type: 'user' },
      })
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
        'src',
        'https://api.example.com/uploads/avatar-key',
      )
    })

    it('avatar img onError falls back to default avatar image', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: { avatar: 'avatar-key', user_type: 'user' },
      })
      renderWithProviders(<Navbar />)
      const img = screen.getByRole('img', { name: 'Jane Doe' })
      await act(async () => {
        img.dispatchEvent(new Event('error', { bubbles: true }))
      })
      await waitFor(() => {
        expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveAttribute(
          'src',
          expect.stringContaining('pinimg.com'),
        )
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

    it('shows branch manager avatar from id_images', () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'branch',
          id_images: [{ file_url: 'https://example.com/id-front.png' }],
        },
      })
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Branch User' })).toHaveAttribute(
        'src',
        'https://example.com/id-front.png',
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

    it('shows vendor logo when business_documents has logo', () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'vendor',
          vendor_id: 10,
          business_documents: [{ type: 'logo', file_url: 'vendor-logo-key' }],
        },
      })
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Vendor User' })).toHaveAttribute(
        'src',
        'https://api.example.com/uploads/vendor-logo-key',
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

    it('shows only dashboard for pending corporate owner', async () => {
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Purchases' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Transactions' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Audit Logs' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Recipients' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Requests' })).not.toBeInTheDocument()
    })

    it('shows purchases and recipients when corporate owner is approved and onboarded', async () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'corporate',
          status: 'approved',
          onboarding_progress: {
            personal_details_completed: true,
            upload_id_completed: true,
            business_details_completed: true,
            business_documents_completed: true,
          },
        },
      })
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      expect(screen.getByRole('button', { name: 'Purchases' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Recipients' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Requests' })).not.toBeInTheDocument()
    })

    it('shows all sidebar tabs for corporate super admin with full access', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: { fullname: 'Super Admin', user_type: 'corporate super admin' },
        logout: mockLogout,
      } as any)
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'corporate super admin',
          status: 'approved',
          onboarding_progress: {
            personal_details_completed: true,
            upload_id_completed: true,
            business_details_completed: true,
            business_documents_completed: true,
          },
        },
      })
      const user = userEvent.setup()
      renderWithProviders(<Navbar />)
      await user.click(screen.getByRole('button', { name: 'Account' }))
      for (const label of [
        'Dashboard',
        'Purchases',
        'Recipients',
        'Requests',
        'Admins',
        'Vendor Invitations',
        'Vendors',
      ]) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
      }
      expect(screen.queryByRole('button', { name: 'Transactions' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Audit Logs' })).not.toBeInTheDocument()
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

    it('shows corporate logo when business_documents has logo', () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'corporate',
          status: 'pending',
          business_documents: [{ type: 'logo', file_url: 'corp-logo-key' }],
        },
      })
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Corp User' })).toHaveAttribute(
        'src',
        'https://api.example.com/uploads/corp-logo-key',
      )
    })

    it('shows corporate logo from business_details when documents omit logo', () => {
      mockUseGetUserProfileService.mockReturnValue({
        data: {
          user_type: 'corporate',
          status: 'pending',
          business_details: [{ logo: 'corp-details-logo-key', name: 'Fuse' }],
        },
      })
      renderWithProviders(<Navbar />)
      expect(screen.getByRole('img', { name: 'Corp User' })).toHaveAttribute(
        'src',
        'https://api.example.com/uploads/corp-details-logo-key',
      )
    })
  })
})
