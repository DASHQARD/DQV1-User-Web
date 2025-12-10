import React, { useEffect, useState, useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs'
import { useUserProfile } from '@/hooks'
import ProfileSwitcher from './ProfileSwitcher'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: userProfile } = useUserProfile()

  // Check if user can switch profiles (show switcher for vendor/corporate/corporate_vendor users)
  const userType = (user as any)?.user_type
  const canSwitchProfiles =
    userType === 'vendor' || userType === 'corporate' || userType === 'corporate_vendor'

  // Determine profile from URL, localStorage, or user type
  const currentProfile = useMemo((): 'vendor' | 'corporate' | null => {
    // Regular users don't have profiles
    if (!canSwitchProfiles) {
      return null
    }
    // Check URL first
    const urlAccount = searchParams.get('account')
    if (urlAccount === 'vendor' || urlAccount === 'corporate') {
      return urlAccount
    }
    // Fallback to localStorage
    const savedProfile = localStorage.getItem('selectedProfile') as 'vendor' | 'corporate' | null
    if (savedProfile === 'vendor' || savedProfile === 'corporate') {
      return savedProfile
    }
    // Fallback to user type
    // For corporate_vendor, default to vendor profile
    if (userType === 'corporate_vendor') {
      return 'vendor'
    }
    if (userType === 'corporate') {
      return 'corporate'
    }
    if (userType === 'vendor') {
      return 'vendor'
    }
    return null
  }, [searchParams, userType, canSwitchProfiles])

  // Use currentProfile directly (it's already computed from URL/localStorage/user type)
  const selectedProfile = currentProfile

  console.log(userProfile)
  // Get user name from JWT decoded user or default
  const userName =
    (user as any)?.name || (user as any)?.fullname || (user as any)?.email?.split('@')[0] || 'User'
  const displayName = userProfile?.fullname || userName

  // Handle profile change
  const handleProfileChange = (profile: 'vendor' | 'corporate') => {
    localStorage.setItem('selectedProfile', profile)

    // Update URL with account parameter
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.set('account', profile)

    // Navigate to home when switching profiles with updated URL
    navigate(`${ROUTES.IN_APP.DASHBOARD.HOME}?${newSearchParams.toString()}`)
  }

  // Update URL if account param is missing but we have a profile
  useEffect(() => {
    const urlAccount = searchParams.get('account')
    if (!urlAccount && canSwitchProfiles && currentProfile) {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.set('account', currentProfile)
      navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true })
    }
  }, [searchParams, currentProfile, canSwitchProfiles, location.pathname, navigate])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', newState.toString())
  }

  const handleLogout = async () => {
    // Clear session storage on logout
    sessionStorage.removeItem('complianceRedirectDone')
    sessionStorage.removeItem('dashboardManuallyAccessed')
    sessionStorage.removeItem('previousDashboardPath')
    logout()
    navigate(ROUTES.IN_APP.AUTH.LOGIN)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsCollapsed(true)
      } else {
        const savedState = localStorage.getItem('sidebarCollapsed')
        if (savedState !== null) {
          setIsCollapsed(savedState === 'true')
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    // For exact matches
    if (location.pathname === path) {
      return true
    }
    // For prefix matches, but exclude child routes that have their own menu items
    if (location.pathname.startsWith(path + '/')) {
      // If this is the compliance route, don't mark it active for add-branch
      if (path === ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT) {
        return !location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH)
      }
      return true
    }
    return false
  }

  // Check user type - use selected profile for navigation
  const isCorporate = selectedProfile === 'corporate'
  const isVendor = selectedProfile === 'vendor'

  // Helper function to add account parameter to URLs
  const addAccountParam = (path: string): string => {
    if (!canSwitchProfiles) return path
    const separator = path?.includes('?') ? '&' : '?'
    return `${path}${separator}account=${selectedProfile}`
  }

  // Vendor-specific navigation items
  const vendorNavItems = [
    {
      section: 'Get Started',
      items: [
        {
          path: ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT,
          label: 'Get Started',
          icon: 'bi:shield-check',
        },
      ],
    },
    {
      section: 'Overview',
      items: [{ path: ROUTES.IN_APP.DASHBOARD.HOME, label: 'Dashboard', icon: 'bi:speedometer2' }],
    },
    {
      section: 'Redemptions',
      items: [
        {
          path: ROUTES.IN_APP.DASHBOARD.REDEMPTIONS,
          label: 'Redemptions',
          icon: 'bi:arrow-left-right',
        },
      ],
    },
    {
      section: 'Transactions',
      items: [
        {
          path: '/dashboard/transactions',
          label: 'Redemption Transactions',
          icon: 'bi:receipt',
        },
      ],
    },
    {
      section: 'Experience',
      items: [
        {
          path: ROUTES.IN_APP.DASHBOARD.EXPERIENCE,
          label: 'My Experience',
          icon: 'bi:briefcase-fill',
        },
      ],
    },
    {
      section: 'Settings & Support',
      items: [
        { path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' },
        {
          path: ROUTES.IN_APP.DASHBOARD.PAYMENT_METHODS,
          label: 'Payment Methods',
          icon: 'bi:credit-card-fill',
        },
      ],
    },
  ]

  // Corporate-specific navigation items
  const corporateNavItems = [
    {
      section: 'Get Started',
      items: [
        {
          path: ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT,
          label: 'Get Started',
          icon: 'bi:shield-check',
        },
      ],
    },
    {
      section: 'Overview',
      items: [{ path: ROUTES.IN_APP.DASHBOARD.HOME, label: 'Dashboard', icon: 'bi:speedometer2' }],
    },
    {
      section: 'Experience',
      items: [
        {
          path: ROUTES.IN_APP.DASHBOARD.EXPERIENCE,
          label: 'My Experience',
          icon: 'bi:briefcase-fill',
        },
      ],
    },
    {
      section: 'Transactions',
      items: [
        { path: '/dashboard/transactions', label: 'Transactions', icon: 'bi:receipt' },
        { path: ROUTES.IN_APP.PURCHASE, label: 'Purchase', icon: 'bi:gift' },
      ],
    },
    {
      section: 'Subscriptions',
      items: [
        {
          path: '/dashboard/subscriptions',
          label: 'Subscriptions',
          icon: 'bi:credit-card-2-front',
        },
      ],
    },
    {
      section: 'Settings & Support',
      items: [
        { path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' },
        {
          path: ROUTES.IN_APP.DASHBOARD.PAYMENT_METHODS,
          label: 'Payment Methods',
          icon: 'bi:credit-card-fill',
        },
        {
          path: ROUTES.IN_APP.DASHBOARD.BRANCHES,
          label: 'Branches',
          icon: 'bi:geo-alt-fill',
        },
      ],
    },
  ]

  // Regular user navigation items
  const regularNavItems = [
    {
      section: 'Gift Cards',
      items: [
        { path: ROUTES.IN_APP.DASHBOARD.ORDERS, label: 'My Orders', icon: 'bi:gift' },
        { path: ROUTES.IN_APP.DASHBOARD.REDEEM, label: 'Redeem', icon: 'bi:card-checklist' },
        { path: ROUTES.IN_APP.DASHBOARD.RECIPIENTS, label: 'Recipients', icon: 'bi:people-fill' },
        { path: '/dashboard/transactions', label: 'Transactions', icon: 'bi:receipt' },
      ],
    },
    {
      section: 'Account',
      items: [{ path: '/dashboard/notifications', label: 'Notifications', icon: 'bi:bell-fill' }],
    },
    {
      section: 'Settings & Support',
      items: [{ path: '/dashboard/settings', label: 'Settings', icon: 'bi:gear-fill' }],
    },
  ]

  // Determine which navigation items to show based on profile
  const navItems = isVendor ? vendorNavItems : isCorporate ? corporateNavItems : regularNavItems

  return (
    <aside
      className={cn(
        'bg-white flex flex-col w-[380px] transition-all duration-300 ease-in-out',
        'shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.04)]',
        'border-r border-black/8 min-h-full h-auto shrink-0 relative z-5',
        'max-lg:hidden',
        isCollapsed && 'w-[90px] shrink-0',
      )}
    >
      <div className="flex flex-col grow min-h-full h-full overflow-hidden relative z-2 p-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 mb-6 border-b border-black/6 bg-white relative z-1">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-xl shadow-[0_4px_12px_rgba(64,45,135,0.25)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_6px_16px_rgba(64,45,135,0.35)]">
                <Icon icon="bi:person-fill" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-[#2c3e50] m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                  {displayName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[#6c757d] font-medium bg-[#f8f9fa] px-3 py-1 rounded-full border border-[#e9ecef] w-fit">
                  <Icon icon="bi:person-badge" className="text-xs text-[#402D87]" />
                  <span>
                    {selectedProfile === 'vendor'
                      ? 'Vendor Account'
                      : selectedProfile === 'corporate'
                        ? 'Corporate Account'
                        : 'Personal Account'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className={cn(
              'bg-transparent border-none p-2 cursor-pointer flex flex-col gap-[3px] transition-all duration-300 rounded-md',
              'hover:bg-black/5',
              isCollapsed &&
                '[&>span:nth-child(1)]:rotate-45 [&>span:nth-child(1)]:translate-x-[5px] [&>span:nth-child(1)]:translate-y-[5px] [&>span:nth-child(2)]:opacity-0 [&>span:nth-child(3)]:rotate-[-45deg] [&>span:nth-child(3)]:translate-x-[5px] [&>span:nth-child(3)]:translate-y-[-5px]',
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="w-5 h-0.5 bg-[#495057] rounded-sm transition-all duration-300 origin-center" />
            <span className="w-5 h-0.5 bg-[#495057] rounded-sm transition-all duration-300 origin-center" />
            <span className="w-5 h-0.5 bg-[#495057] rounded-sm transition-all duration-300 origin-center" />
          </button>
        </div>

        {/* Profile Switcher */}
        {!isCollapsed && canSwitchProfiles && (
          <div className="px-6 mb-4">
            <ProfileSwitcher value={selectedProfile ?? undefined} onChange={handleProfileChange} />
          </div>
        )}

        {/* Navigation */}
        <nav className="grow relative z-1">
          <ul className="list-none p-0 m-0 px-5">
            {navItems.map((section) => (
              <React.Fragment key={section.section}>
                {!isCollapsed && (
                  <li className="py-5 px-5 mt-5 first:mt-3">
                    <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-[#6c757d]/90 relative flex items-center after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-5 after:h-0.5 after:bg-gradient-to-r after:from-[#402D87] after:to-[rgba(64,45,135,0.4)] after:rounded-sm after:shadow-[0_1px_2px_rgba(64,45,135,0.2)] before:content-[''] before:absolute before:top-[-0.5rem] before:left-[-1.25rem] before:right-[-1.25rem] before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/6 before:to-transparent">
                      {section.section}
                    </span>
                  </li>
                )}
                {section.items.map((item) => (
                  <li
                    key={item.path}
                    className={cn(
                      'flex items-center mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
                      isActive(item.path) &&
                        'bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] rounded-l-none rounded-r-[10px] shadow-[0_2px_8px_rgba(64,45,135,0.1)]',
                      !isActive(item.path) &&
                        'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
                      isCollapsed && 'justify-center mb-3',
                    )}
                  >
                    {isActive(item.path) && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-white/30 via-[#402D87] to-[#2d1a72] rounded-r-sm shadow-[2px_0_8px_rgba(64,45,135,0.4),2px_0_16px_rgba(64,45,135,0.2)]" />
                        <div className="absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/8 via-transparent to-[rgba(45,26,114,0.03)] pointer-events-none" />
                      </>
                    )}
                    <Link
                      to={addAccountParam(item.path)}
                      className={cn(
                        'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2',
                        isActive(item.path) &&
                          'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                        !isActive(item.path) && 'hover:text-[#402D87]',
                        isCollapsed && 'justify-center py-4 px-3',
                      )}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon
                        icon={item.icon}
                        className={cn(
                          'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                          isActive(item.path) && 'text-[#402D87]',
                          !isActive(item.path) &&
                            'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                        )}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                    {isCollapsed && isActive(item.path) && (
                      <div className="absolute right-[-0.75rem] top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-[#402D87] to-[#2d1a72] rounded-l-sm" />
                    )}
                  </li>
                ))}
              </React.Fragment>
            ))}

            {/* Logout */}
            {!isCollapsed && (
              <li className="py-5 px-5 mt-5">
                <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-[#6c757d]/90 relative flex items-center after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-5 after:h-0.5 after:bg-gradient-to-r after:from-[#402D87] after:to-[rgba(64,45,135,0.4)] after:rounded-sm after:shadow-[0_1px_2px_rgba(64,45,135,0.2)] before:content-[''] before:absolute before:top-[-0.5rem] before:left-[-1.25rem] before:right-[-1.25rem] before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/6 before:to-transparent">
                  Account Actions
                </span>
              </li>
            )}
            <li
              className={cn(
                'flex items-center mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
                !isCollapsed && 'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
                isCollapsed && 'justify-center mb-3',
              )}
            >
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 cursor-pointer bg-transparent border-none',
                  'hover:text-[#402D87]',
                  isCollapsed && 'justify-center py-4 px-3',
                )}
                title={isCollapsed ? 'Logout' : ''}
              >
                <Icon
                  icon="bi:box-arrow-right"
                  className="w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d] hover:scale-110 hover:rotate-2 hover:text-[#402D87]"
                />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
