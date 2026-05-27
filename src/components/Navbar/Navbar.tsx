import { useState, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/libs/clsx'
import Logo from '../../assets/images/logo-placeholder.png'
import { ROUTES } from '../../utils/constants'
import { Icon } from '@/libs'

// import { useCart } from '@/features/website/hooks/useCart'
import { useAuthStore, useCartStore } from '@/stores'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/PopOver'
import { Modal } from '@/components'
import { CartPopoverContent } from '@/components/CartModal'
import { GuestAddToCartModal } from '@/features/website/components/GuestAddToCartModal'
import { useUserProfile, usePresignedMediaUrl } from '@/hooks'
import { getBusinessLogoFileKey } from '@/utils/businessLogo'
import { getBranchUserAvatarUrl } from '@/utils/branchUserAvatar'
import { DEFAULT_AVATAR_SRC } from '@/components/Avatar/Avatar'
import { vendorQueries } from '@/features'
import { useAuth } from '@/features/auth'
import { getGuestNameFromAuth } from '@/features/website/utils/guestAuth'
import {
  buildCorporateAccountMenuItems,
  getCorporateAccessState,
  isAnyCorporateUser,
} from '@/features/dashboard/corporate/utils/corporateNavAccess'

/** Whether a website nav item should appear selected for the current path. */
function isWebsiteNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true

  if (itemPath === ROUTES.IN_APP.VENDORS) {
    return pathname === '/vendor' || pathname.startsWith('/vendors/')
  }

  if (itemPath === ROUTES.IN_APP.DASHQARDS) {
    return pathname.startsWith('/card/')
  }

  return pathname.startsWith(`${itemPath}/`)
}

type NavbarProps = {
  variant?: 'website' | 'dashboard'
}

export default function Navbar({ variant = 'website' }: NavbarProps) {
  const isDashboardVariant = variant === 'dashboard'
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // const { cartItems } = useCart()
  const { isOpen: isCartOpen, openCart, closeCart } = useCartStore()

  const { isAuthenticated, isGuestAuth, user, logout: clearAuthState } = useAuthStore()
  const { useLogoutService } = useAuth()
  const { mutateAsync: logoutMutation } = useLogoutService()
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetBranchesByVendorIdService } = vendorQueries()
  // const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const displayName = isGuestAuth
    ? getGuestNameFromAuth(user) || 'Guest'
    : userProfileData?.fullname?.trim() ||
      user?.fullname ||
      user?.name ||
      userProfileData?.email?.split('@')[0] ||
      user?.email?.split('@')[0] ||
      user?.username ||
      'there'

  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if user is a regular user (not vendor, corporate, branch manager)
  const isRegularUser = useMemo(() => {
    const userType = (user as any)?.user_type || userProfileData?.user_type
    return !userType || userType === 'user'
  }, [user, userProfileData])

  // Get user type
  const currentUserType = (user as any)?.user_type || userProfileData?.user_type
  const isCorporateUser = isAnyCorporateUser(currentUserType)

  // Get user type and status (moved up to use in useEffect)
  const userStatus = (user as any)?.status || userProfileData?.status
  const userType = currentUserType
  const isVendor = userType === 'vendor' || userType === 'corporate_vendor'
  const isBranchManager = userType === 'branch'
  const isApprovedOrVerified = userStatus === 'approved' || userStatus === 'verified'

  // Get vendor_id for fetching branches
  const vendorId = userProfileData?.vendor_id ? String(userProfileData.vendor_id) : null
  const { data: branchesData } = useGetBranchesByVendorIdService(vendorId, false)

  // Get first branch for navigation
  const firstBranch = useMemo(() => {
    if (!branchesData || !Array.isArray(branchesData) || branchesData.length === 0) return null
    return branchesData[0]
  }, [branchesData])

  const avatarFileKey = useMemo(() => {
    if (!isAuthenticated) return null
    if (isRegularUser) return userProfileData?.avatar || null
    if (isCorporateUser || isVendor) {
      return getBusinessLogoFileKey(userProfileData)
    }
    if (isBranchManager) return getBranchUserAvatarUrl(userProfileData)
    return null
  }, [
    isAuthenticated,
    isRegularUser,
    isCorporateUser,
    isVendor,
    isBranchManager,
    userProfileData,
  ])

  const { url: avatarUrl } = usePresignedMediaUrl(avatarFileKey)

  // Menu items based on user type
  const menuItems = useMemo(() => {
    if (isGuestAuth) {
      return [
        {
          label: 'Gift Cards',
          icon: 'bi:bag-heart',
          path: ROUTES.IN_APP.DASHQARDS,
        },
        {
          label: 'View Bag',
          icon: 'bi:bag',
          path: ROUTES.IN_APP.VIEW_BAG,
        },
        {
          label: 'Cards',
          icon: 'bi:credit-card-2-front',
          path: ROUTES.IN_APP.GUEST.CARDS,
        },
        {
          label: 'My Orders',
          icon: 'bi:gift',
          path: ROUTES.IN_APP.GUEST.ORDERS,
        },
        {
          label: 'Redemptions',
          icon: 'bi:arrow-left-right',
          path: ROUTES.IN_APP.REDEEM,
        },
      ]
    }

    // Branch manager menu items
    if (isBranchManager) {
      return [
        {
          label: 'Dashboard',
          icon: 'bi:speedometer2',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`,
        },
        {
          label: 'My Experience',
          icon: 'bi:briefcase-fill',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE}?account=vendor`,
        },
        {
          label: 'Redemptions',
          icon: 'bi:arrow-left-right',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`,
        },
      ]
    }

    // Vendor menu items
    if (isVendor) {
      // Build branches path - navigate to first branch if available, otherwise listing page
      const branchesPath = (() => {
        if (firstBranch) {
          const branchId = firstBranch.id || firstBranch.branch_id
          const queryParams = new URLSearchParams()
          queryParams.set('account', 'vendor')
          if (vendorId) queryParams.set('vendor_id', String(vendorId))
          if (branchId) queryParams.set('branch_id', String(branchId))
          return `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${branchId}?${queryParams.toString()}`
        }
        return `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}?account=vendor`
      })()

      return [
        {
          label: 'Dashboard',
          icon: 'bi:speedometer2',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor`,
        },
        {
          label: 'My Experience',
          icon: 'bi:briefcase-fill',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.EXPERIENCE}?account=vendor`,
        },
        {
          label: 'Branches',
          icon: 'bi:building',
          path: branchesPath,
        },
        {
          label: 'Redemptions',
          icon: 'bi:arrow-left-right',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`,
        },
      ]
    }

    // Corporate menu items (same entries as corporate sidebar)
    if (isCorporateUser) {
      const { canAccessRestrictedFeatures } = getCorporateAccessState(userProfileData)
      return buildCorporateAccountMenuItems({
        userType,
        canAccessRestrictedFeatures,
      })
    }

    // Regular user menu items (default)
    return [
      {
        label: 'Dashboard',
        icon: 'bi:speedometer2',
        path: ROUTES.IN_APP.DASHBOARD.HOME,
      },
      {
        label: 'Cards',
        icon: 'bi:credit-card-2-front',
        path: ROUTES.IN_APP.DASHBOARD.MY_CARDS,
      },
      {
        label: 'My Orders',
        icon: 'bi:gift',
        path: ROUTES.IN_APP.DASHBOARD.ORDERS,
      },
      {
        label: 'Redemptions',
        icon: 'bi:arrow-left-right',
        path: ROUTES.IN_APP.DASHBOARD.REDEMPTIONS,
      },
      // {
      //   label: 'Notifications',
      //   icon: 'bi:bell-fill',
      //   path: '/dashboard/notifications',
      // },
    ]
  }, [
    isGuestAuth,
    isCorporateUser,
    userProfileData,
    isVendor,
    isBranchManager,
    isApprovedOrVerified,
    firstBranch,
    vendorId,
  ])

  const navItems = [
    {
      label: 'About',
      path: ROUTES.IN_APP.ABOUT,
    },
    {
      label: 'Gift Cards',
      path: ROUTES.IN_APP.DASHQARDS,
    },
    {
      label: 'Vendors',
      path: ROUTES.IN_APP.VENDORS,
    },
    {
      label: 'Redeem',
      path: ROUTES.IN_APP.REDEEM,
    },
    {
      label: 'Contact',
      path: ROUTES.IN_APP.CONTACT,
    },
    {
      label: 'FAQ',
      path: ROUTES.IN_APP.FAQ,
    },
  ]

  const showNavProfileImage =
    isAuthenticated &&
    !isGuestAuth &&
    (isRegularUser || isCorporateUser || isVendor || isBranchManager)
  const navAvatarDisplaySrc = avatarUrl ?? DEFAULT_AVATAR_SRC

  const handleLogout = () => {
    logoutMutation(undefined, {
      onSettled: () => {
        clearAuthState()
        navigate(ROUTES.IN_APP.HOME, { replace: true })
      },
    })
  }

  return (
    <>
      <nav
        className={cn(
          'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm shrink-0',
          isDashboardVariant && 'relative',
        )}
      >
        <div
          className={cn(
            'flex justify-between items-center',
            isDashboardVariant ? 'px-4 sm:px-6 py-2.5' : 'wrapper py-3',
          )}
        >
          {/* Logo */}
          <Link to={ROUTES.IN_APP.HOME} className="shrink-0">
            <img src={Logo} alt="Logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <section className="hidden lg:flex items-center gap-3">
            {/* Navigation Items */}
            {!isDashboardVariant ? (
            <ul className="hidden xl:flex items-center gap-2 bg-gray-50 py-2.5 px-5 rounded-full text-sm">
              {navItems.map((item) => {
                const isActive = isWebsiteNavItemActive(pathname, item.path)
                return (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg transition-colors',
                        isActive
                          ? 'text-primary-600 bg-white shadow-sm font-semibold'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-white',
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
            ) : null}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => navigate(ROUTES.IN_APP.DASHQARDS)}
                className="bg-gray-50 p-2.5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Icon icon="hugeicons:search-02" className="size-5 text-gray-700" />
              </button>

              {/* Cart Button */}
              <button
                type="button"
                onClick={() => openCart()}
                className="bg-gray-50 p-2.5 flex items-center justify-center rounded-full relative hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <Icon icon="bi:bag" className="size-5 text-gray-700" />
                {/* {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )} */}
              </button>
              <Modal
                position="side"
                isOpen={isCartOpen}
                setIsOpen={(open) => (open ? openCart() : closeCart())}
                panelClass="!w-[393px] max-w-[90vw] p-0"
                overflowHidden
              >
                <CartPopoverContent />
              </Modal>
              <GuestAddToCartModal />

              {/* Account Button */}
              {isAuthenticated ? (
                <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-gray-50 flex items-center justify-center rounded-full overflow-hidden relative hover:bg-gray-100 transition-colors ring-2 ring-transparent hover:ring-primary-200"
                      aria-label="Account"
                    >
                      {showNavProfileImage ? (
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={navAvatarDisplaySrc}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              // Fall back to default avatar when logo/avatar URL fails.
                              // Keep this handler stateless because avatarUrl is memo-derived.
                              const img = e.currentTarget as HTMLImageElement | undefined
                              if (img) img.src = DEFAULT_AVATAR_SRC
                            }}
                          />
                        </div>
                      ) : (
                        <Icon icon="bi:person-circle" className="size-10 text-primary-600" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={12}
                    className="w-64 p-0 border border-gray-200 rounded-xl shadow-xl bg-white"
                  >
                    <div className="p-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                      <p className="text-sm text-gray-600">
                        Hi, <span className="font-semibold text-gray-900">{displayName}</span>
                      </p>
                    </div>
                    <div className="flex flex-col p-2 gap-0.5 text-sm">
                      {menuItems.map((item) => (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => {
                            navigate(item.path)
                            setAccountPopoverOpen(false)
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                        >
                          <Icon icon={item.icon} className="text-lg shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout()
                          setAccountPopoverOpen(false)
                          navigate(ROUTES.IN_APP.HOME)
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 text-red-600 font-semibold hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors w-full"
                      >
                        <Icon icon="bi:box-arrow-right" className="text-lg shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex items-center gap-2 bg-gray-50 py-2 px-4 rounded-full">
                  <Link
                    to={ROUTES.IN_APP.AUTH.LOGIN}
                    className="text-sm text-gray-700 font-medium hover:text-primary-600 transition-colors"
                  >
                    Login
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to={ROUTES.IN_APP.AUTH.REGISTER}
                    className="text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => openCart()}
                  className="bg-gray-50 p-2.5 flex items-center justify-center rounded-full relative hover:bg-gray-100 transition-colors"
                  aria-label="Cart"
                >
                  <Icon icon="bi:bag" className="size-5 text-gray-700" />
                </button>
                <Modal
                  position="side"
                  isOpen={isCartOpen}
                  setIsOpen={(open) => (open ? openCart() : closeCart())}
                  panelClass="!w-[393px] max-w-[90vw] p-0"
                  overflowHidden
                >
                  <CartPopoverContent />
                </Modal>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-gray-50 p-2.5 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <Icon
                icon={mobileMenuOpen ? 'bi:x-lg' : 'bi:list'}
                className="size-5 text-gray-700"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white flex flex-col max-h-[calc(100dvh-4.5rem)]">
            <div className="flex-1 overflow-y-auto">
              <div className={cn('px-4 py-4 space-y-3', !isDashboardVariant && 'wrapper')}>
              {!isDashboardVariant ? (
                <>
                  <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                      const isActive = isWebsiteNavItemActive(pathname, item.path)
                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          aria-current={isActive ? 'page' : undefined}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-2 py-3 font-medium rounded-lg transition-colors',
                            isActive
                              ? 'bg-primary-50 text-primary-600 font-semibold'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600',
                          )}
                        >
                          <Icon icon="bi:chevron-right" className="text-lg text-gray-400" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(ROUTES.IN_APP.DASHQARDS)
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors w-full text-left"
                  >
                    <Icon icon="hugeicons:search-02" className="text-lg text-gray-400" />
                    <span>Search</span>
                  </button>
                </>
              ) : null}

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                      {showNavProfileImage ? (
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={navAvatarDisplaySrc}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement | undefined
                              if (img) img.src = DEFAULT_AVATAR_SRC
                            }}
                          />
                        </div>
                      ) : (
                        <Icon icon="bi:person-circle" className="size-10 text-primary-600" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-500">Account</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {menuItems.map((item) => (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => {
                            navigate(item.path)
                            setMobileMenuOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                        >
                          <Icon icon={item.icon} className="text-lg shrink-0" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                        navigate(ROUTES.IN_APP.HOME)
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-red-600 font-semibold hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors w-full mt-2"
                    >
                      <Icon icon="bi:box-arrow-right" className="text-lg shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : null}
              </div>
            </div>
            {!isAuthenticated && (
              <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
                <div className="wrapper flex flex-col gap-2">
                  <Link
                    to={ROUTES.IN_APP.AUTH.LOGIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 text-gray-700 font-medium border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to={ROUTES.IN_APP.AUTH.REGISTER}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-2.5 bg-primary-500 text-white font-semibold hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  )
}
