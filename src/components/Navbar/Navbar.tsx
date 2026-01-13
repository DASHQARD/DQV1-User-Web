import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../assets/images/logo-placeholder.png'
import { ROUTES } from '../../utils/constants'
import { Icon } from '@/libs'

// import { useCart } from '@/features/website/hooks/useCart'
import { useAuthStore, useCartStore } from '@/stores'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/PopOver'
import { Modal } from '@/components'
import { CartPopoverContent } from '@/components/CartModal'
import { useUserProfile, usePresignedURL } from '@/hooks'

export default function Navbar() {
  const navigate = useNavigate()

  // const { cartItems } = useCart()
  const { isOpen: isCartOpen, openCart, closeCart } = useCartStore()

  const { isAuthenticated, user, logout } = useAuthStore()
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { mutateAsync: fetchPresignedURL } = usePresignedURL()
  // const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const displayName =
    user?.fullname || user?.name || user?.email?.split('@')[0] || user?.username || 'there'

  // State for avatar URL
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if user is a regular user (not vendor, corporate, branch manager)
  const isRegularUser = useMemo(() => {
    const userType = (user as any)?.user_type || userProfileData?.user_type
    return !userType || userType === 'user'
  }, [user, userProfileData])

  // Fetch current avatar from user profile (only for regular users)
  useEffect(() => {
    if (!isAuthenticated || !isRegularUser || !userProfileData?.avatar) {
      setAvatarUrl(null)
      return
    }

    let cancelled = false
    const loadAvatar = async () => {
      try {
        const url = await fetchPresignedURL(userProfileData.avatar!)
        if (!cancelled) {
          const avatarUrlValue = typeof url === 'string' ? url : (url as any)?.url || url
          setAvatarUrl(avatarUrlValue)
        }
      } catch (error) {
        console.error('Failed to fetch avatar', error)
        if (!cancelled) {
          setAvatarUrl(null)
        }
      }
    }
    loadAvatar()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isRegularUser, userProfileData?.avatar, fetchPresignedURL])

  // Get user type and status (reuse from isRegularUser check)
  const currentUserType = (user as any)?.user_type || userProfileData?.user_type
  const userStatus = (user as any)?.status || userProfileData?.status
  const userType = currentUserType
  const isCorporateAdmin = userType === 'corporate admin'
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const isCorporate = userType === 'corporate' || isCorporateSuperAdmin
  const isVendor = userType === 'vendor' || userType === 'corporate_vendor'
  const isBranchManager = userType === 'branch'
  const isApprovedOrVerified = userStatus === 'approved' || userStatus === 'verified'

  // Menu items based on user type
  const menuItems = useMemo(() => {
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
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}?account=vendor`,
        },
        {
          label: 'Redemptions',
          icon: 'bi:arrow-left-right',
          path: `${ROUTES.IN_APP.DASHBOARD.VENDOR.REDEMPTIONS}?account=vendor`,
        },
      ]
    }

    // Corporate menu items
    if (isCorporate || isCorporateAdmin) {
      const items = [
        {
          label: 'Dashboard',
          icon: 'bi:grid',
          path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`,
        },
        {
          label: 'Transactions',
          icon: 'bi:receipt',
          path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.TRANSACTIONS}?account=corporate`,
        },
      ]

      // Add purchase, requests if approved/verified
      if (isApprovedOrVerified) {
        items.push(
          {
            label: 'Purchase',
            icon: 'bi:gift',
            path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.PURCHASE}?account=corporate`,
          },
          {
            label: 'Requests',
            icon: 'bi:clipboard-check',
            path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS}?account=corporate`,
          },
        )
      }

      items.push({
        label: 'Audit Logs',
        icon: 'bi:journal-text',
        path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS}?account=corporate`,
      })

      // Only show Admins and Notifications for corporate super admin (not corporate admin)
      if (isCorporateSuperAdmin && isApprovedOrVerified) {
        items.push(
          {
            label: 'Admins',
            icon: 'bi:people-fill',
            path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.ADMINS}?account=corporate`,
          },
          {
            label: 'Notifications',
            icon: 'bi:bell-fill',
            path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.NOTIFICATIONS}?account=corporate`,
          },
        )
      }

      items.push({
        label: 'Recipients',
        icon: 'bi:person-lines-fill',
        path: `${ROUTES.IN_APP.DASHBOARD.CORPORATE.RECIPIENTS}?account=corporate`,
      })

      return items
    }

    // Regular user menu items (default)
    return [
      {
        label: 'Dashboard',
        icon: 'bi:grid',
        path: ROUTES.IN_APP.DASHBOARD.HOME,
      },
      {
        label: 'My Orders',
        icon: 'bi:box',
        path: ROUTES.IN_APP.DASHBOARD.ORDERS,
      },
    ]
  }, [
    isCorporateAdmin,
    isCorporateSuperAdmin,
    isCorporate,
    isVendor,
    isBranchManager,
    isApprovedOrVerified,
  ])

  const navItems = [
    {
      label: 'About',
      path: ROUTES.IN_APP.ABOUT,
    },
    {
      label: 'Gift Cards',
      path: ROUTES.IN_APP.SEARCH_CARDS,
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
  ]
  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
        <div className="wrapper flex justify-between items-center py-3 px-4 lg:px-6">
          {/* Logo */}
          <Link to={ROUTES.IN_APP.HOME} className="shrink-0">
            <img src={Logo} alt="Logo" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <section className="hidden lg:flex items-center gap-3">
            {/* Navigation Items */}
            <ul className="hidden xl:flex items-center gap-2 bg-gray-50 py-2.5 px-5 rounded-full text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 font-medium hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </ul>

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

              {/* Account Button */}
              {isAuthenticated ? (
                <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="bg-gray-50 flex items-center justify-center rounded-full overflow-hidden relative hover:bg-gray-100 transition-colors ring-2 ring-transparent hover:ring-primary-200"
                      aria-label="Account"
                    >
                      {isRegularUser && avatarUrl ? (
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setAvatarUrl(null)}
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
                          logout()
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
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="wrapper px-4 py-4 space-y-3">
              {/* Mobile Navigation Items */}
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors"
                  >
                    <Icon icon="bi:chevron-right" className="text-lg text-gray-400" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Search */}
              <button
                onClick={() => {
                  navigate(ROUTES.IN_APP.DASHQARDS)
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:text-primary-600 rounded-lg transition-colors w-full text-left"
              >
                <Icon icon="hugeicons:search-02" className="text-lg text-gray-400" />
                <span>Search</span>
              </button>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                      {isRegularUser && avatarUrl ? (
                        <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full rounded-full object-cover"
                            onError={() => setAvatarUrl(null)}
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
                        logout()
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
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 flex flex-col gap-2">
                  <Link
                    to={ROUTES.IN_APP.AUTH.LOGIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to={ROUTES.IN_APP.AUTH.REGISTER}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white font-semibold hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
