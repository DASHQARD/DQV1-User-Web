import React from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { CORPORATE_NAV_ITEMS, REGULAR_NAV_ITEMS, ROUTES, VENDOR_NAV_ITEMS } from '@/utils/constants'
import { cn } from '@/libs'
import { useUserProfile } from '@/hooks'
import { Logo } from '@/assets/images'
import { Avatar, Text, Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/PopOver'
import { PaymentChangeNotifications } from './corporate/notifications/PaymentChangeNotifications'
import { ExperienceApprovalNotifications } from './corporate/notifications/ExperienceApprovalNotifications'
import { CreateVendorAccount } from './corporate/modals'
import { MODALS } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const { data: userProfile } = useUserProfile()
  const vendorAccountModal = usePersistedModalState({
    paramName: MODALS.VENDOR_ACCOUNT.CREATE,
  })

  console.log('userProfile', userProfile)

  // Check if user can switch profiles (show switcher for vendor/corporate/corporate_vendor users)
  const userType = (user as any)?.user_type
  const canSwitchProfiles =
    userType === 'vendor' || userType === 'corporate' || userType === 'corporate_vendor'

  // Determine profile from URL, localStorage, or user type
  const currentProfile = React.useMemo((): 'vendor' | 'corporate' | null => {
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
  const fullName = userProfile?.fullname || userName

  // Get initials from full name
  const getInitials = (name?: string) => {
    if (!name) return ''
    const parts = name.trim().split(' ')
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const displayName = getInitials(fullName)

  // Update URL if account param is missing but we have a profile
  React.useEffect(() => {
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
    setIsPopoverOpen(false) // Close popover when sidebar toggles
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

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsCollapsed(true)
        setIsPopoverOpen(false)
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

  // Regular user navigation items

  // Determine which navigation items to show based on profile
  const navItems = isVendor
    ? VENDOR_NAV_ITEMS
    : isCorporate
      ? CORPORATE_NAV_ITEMS
      : REGULAR_NAV_ITEMS

  return (
    <aside
      className={cn(
        'bg-white flex flex-col w-[312px] transition-all duration-300 ease-in-out',
        'shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.04)]',
        'border-r border-black/8 h-screen shrink-0 relative z-5',
        'max-lg:hidden',
        isCollapsed && 'w-[90px] shrink-0',
      )}
    >
      <div className="flex flex-col h-full relative z-2 p-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 mb-6 border-b border-black/6 bg-white relative z-1 shrink-0">
          {!isCollapsed && <img src={Logo} alt="logo" className="w-12 h-12" />}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSidebar}
                className={cn(
                  'bg-transparent border-none p-2 cursor-pointer flex flex-col gap-[3px] transition-all duration-300 rounded-md text-[#9ba2b0]',
                  'hover:bg-black/5',
                )}
              >
                <svg
                  fill="currentColor"
                  height="18"
                  viewBox="0 0 18 18"
                  width="18"
                  xmlns="http://www.w3.org/2000/svg"
                  data-sentry-element="svg"
                  data-sentry-source-file="Nav.tsx"
                  className={cn(
                    'transition-transform duration-300',
                    isCollapsed && 'transform:scaleX(-1)',
                  )}
                >
                  <path
                    clip-rule="evenodd"
                    d="M16 1.5H6.596C6.5624 1.5 6.5456 1.5 6.53276 1.50654C6.52147 1.51229 6.51229 1.52147 6.50654 1.53276C6.5 1.5456 6.5 1.5624 6.5 1.596V16.404C6.5 16.4376 6.5 16.4544 6.50654 16.4672C6.51229 16.4785 6.52147 16.4877 6.53276 16.4935C6.5456 16.5 6.5624 16.5 6.596 16.5H16C16.2761 16.5 16.5 16.2761 16.5 16V2C16.5 1.72386 16.2761 1.5 16 1.5ZM2 0H5H6.5H16C17.1046 0 18 0.895431 18 2V16C18 17.1046 17.1046 18 16 18H2C0.89543 18 0 17.1046 0 16V2C0 0.89543 0.895431 0 2 0ZM4.904 16.5C4.9376 16.5 4.9544 16.5 4.96724 16.4935C4.97853 16.4877 4.98771 16.4785 4.99346 16.4672C5 16.4544 5 16.4376 5 16.404V1.596C5 1.5624 5 1.5456 4.99346 1.53276C4.98771 1.52147 4.97853 1.51229 4.96724 1.50654C4.9544 1.5 4.9376 1.5 4.904 1.5H2C1.72386 1.5 1.5 1.72386 1.5 2V16C1.5 16.2761 1.72386 16.5 2 16.5H4.904ZM12.3376 5.53755C12.3138 5.51379 12.3019 5.50191 12.2882 5.49746C12.2762 5.49354 12.2632 5.49354 12.2511 5.49746C12.2374 5.50191 12.2255 5.51379 12.2018 5.53755L9.46967 8.26967L9.00722 8.73212C8.98346 8.75588 8.97158 8.76776 8.96713 8.78146C8.96321 8.79351 8.96321 8.80649 8.96713 8.81854C8.97158 8.83224 8.98346 8.84412 9.00722 8.86788L9.46967 9.33033L12.2018 12.0624C12.2255 12.0862 12.2374 12.0981 12.2511 12.1025C12.2632 12.1065 12.2762 12.1065 12.2882 12.1025C12.3019 12.0981 12.3138 12.0862 12.3376 12.0624L13.2624 11.1376C13.2862 11.1138 13.2981 11.1019 13.3025 11.0882C13.3065 11.0762 13.3065 11.0632 13.3025 11.0511C13.2981 11.0374 13.2862 11.0255 13.2624 11.0018L11.1285 8.86788C11.1048 8.84412 11.0929 8.83224 11.0884 8.81854C11.0845 8.80649 11.0845 8.79351 11.0884 8.78146C11.0929 8.76776 11.1048 8.75588 11.1285 8.73212L13.2624 6.59821C13.2862 6.57445 13.2981 6.56257 13.3025 6.54887C13.3065 6.53682 13.3065 6.52384 13.3025 6.51179C13.2981 6.49809 13.2862 6.48621 13.2624 6.46245L12.3376 5.53755Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    data-sentry-element="path"
                    data-sentry-source-file="Nav.tsx"
                  ></path>
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4 px-2 py-1 border border-[#e5e7eb] rounded-xl mx-4 shrink-0">
          <div
            className={cn(
              'flex min-w-0 px-2 py-1 items-center',
              isCollapsed ? 'justify-center w-full' : 'flex-1 items-start justify-between',
            )}
          >
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                src="https://unsplash.com/photos/man-wearing-white-v-neck-shirt-iFgRcqHznqg"
              />
              {!isCollapsed && (
                <div>
                  <Text variant="span" weight="normal">
                    {selectedProfile === 'vendor'
                      ? 'Vendor Account'
                      : selectedProfile === 'corporate'
                        ? `Corporate Account #${userProfile?.id || ''}`
                        : 'Personal Account'}
                  </Text>

                  <Text variant="span" className="text-[#677084]">
                    {displayName}
                  </Text>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-2">
                {/* Payment Change Notifications - Only for vendor/corporate super admins */}
                {(isVendor || isCorporate) && <PaymentChangeNotifications />}
                {/* Experience Approval Notifications - Only for vendor admins */}
                {isVendor && <ExperienceApprovalNotifications />}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                          <svg
                            fill="none"
                            focusable="false"
                            height="16"
                            role="img"
                            stroke-width="1"
                            viewBox="0 0 24 24"
                            width="16"
                            className={cn(
                              'text-[#677084] transition-transform',
                              isPopoverOpen && 'rotate-90',
                            )}
                          >
                            <path
                              d="M8.46973 6.53039L13.9394 12.0001L8.46973 17.4697L9.53039 18.5304L16.0607 12.0001L9.53039 5.46973L8.46973 6.53039Z"
                              fill="currentColor"
                            ></path>
                          </svg>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Account menu</TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="min-w-[280px] max-w-[320px] p-0 bg-white border-none"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" src={userProfile?.avatar} />
                        <div className="flex-1 min-w-0">
                          <Text variant="span" weight="semibold" className="block text-sm">
                            {selectedProfile === 'vendor'
                              ? 'Vendor Account'
                              : selectedProfile === 'corporate'
                                ? `Corporate Account #${userProfile?.id || ''}`
                                : 'Personal Account'}
                          </Text>
                          <Text variant="span" className="text-xs text-[#677084] block truncate">
                            {displayName}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-2">
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.TRANSACTIONS)}
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="bi:bar-chart" className="text-lg text-[#677084]" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.RECIPIENTS)}
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="bi:people" className="text-lg text-[#677084]" />
                        <span>Network</span>
                      </Link>
                      <Link
                        to={addAccountParam(ROUTES.IN_APP.DASHBOARD.GIFT_CARDS.ROOT)}
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="bi:briefcase" className="text-lg text-[#677084]" />
                        <span>Portfolio</span>
                      </Link>
                      <Link
                        to="/dashboard/settings"
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon icon="bi:gear" className="text-lg text-[#677084]" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Icon icon="bi:exclamation-triangle" className="text-lg text-[#677084]" />
                        <span>Set availability</span>
                      </button>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Switch Workspace */}
                    <div className="px-4 py-2">
                      <Text
                        variant="span"
                        className="text-xs text-gray-500 uppercase tracking-wider block mb-2"
                      >
                        Switch Workspace
                      </Text>
                      <button
                        onClick={() => {
                          setIsPopoverOpen(false)
                          vendorAccountModal.openModal(MODALS.VENDOR_ACCOUNT.CREATE)
                        }}
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors mb-3"
                      >
                        <Icon icon="bi:plus-circle" className="text-lg" />
                        <span>Create a vendor account</span>
                      </button>
                      <CreateVendorAccount />

                      {/* Fake Vendor Account Entry */}
                      <button
                        onClick={() => {
                          setIsPopoverOpen(false)
                          // TODO: Handle vendor account switching
                        }}
                        className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      >
                        <Avatar size="sm" src={userProfile?.avatar} />
                        <div className="flex-1 min-w-0">
                          <Text variant="span" weight="semibold" className="block text-sm">
                            Vendor Account #{userProfile?.id || '000'}
                          </Text>
                          <Text variant="span" className="text-xs text-[#677084] block truncate">
                            {displayName}
                          </Text>
                        </div>
                        <Icon icon="bi:chevron-right" className="text-gray-400 text-sm" />
                      </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={() => setIsPopoverOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Icon icon="bi:question-circle" className="text-lg text-[#677084]" />
                        <span>Help</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsPopoverOpen(false)
                          handleLogout()
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                      >
                        <Icon icon="bi:box-arrow-right" className="text-lg text-[#677084]" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden relative z-1">
          <ul className="list-none p-0 m-0 px-5 pb-4">
            {navItems.map((section) => (
              <React.Fragment key={section.section}>
                {!isCollapsed && (
                  <li className="py-5 px-5 mt-5 first:mt-3">
                    <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-[#6c757d]/90 relative flex items-center after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-5 after:h-0.5 after:bg-linear-to-r after:from-[#402D87] after:to-[rgba(64,45,135,0.4)] after:rounded-sm after:shadow-[0_1px_2px_rgba(64,45,135,0.2)] before:content-[''] before:absolute before:top-[-0.5rem] before:left-[-1.25rem] before:right-[-1.25rem] before:h-px before:bg-gradient-to-r before:from-transparent before:via-black/6 before:to-transparent">
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
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={addAccountParam(item.path)}
                            className={cn(
                              'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 justify-center',
                              isActive(item.path) &&
                                'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                              !isActive(item.path) && 'hover:text-[#402D87]',
                            )}
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
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-black text-white">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        to={addAccountParam(item.path)}
                        className={cn(
                          'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2',
                          isActive(item.path) &&
                            'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                          !isActive(item.path) && 'hover:text-[#402D87]',
                        )}
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
                        <span>{item.label}</span>
                      </Link>
                    )}
                    {isCollapsed && isActive(item.path) && (
                      <div className="absolute right-[-0.75rem] top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-[#402D87] to-[#2d1a72] rounded-l-sm" />
                    )}
                  </li>
                ))}
              </React.Fragment>
            ))}

            {/* Logout */}
            {!isCollapsed && (
              <li className="py-5 px-5 mt-5">
                <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-[#6c757d]/90 relative flex items-center after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-5 after:h-0.5 after:bg-linear-to-r after:from-[#402D87] after:to-[rgba(64,45,135,0.4)] after:rounded-sm after:shadow-[0_1px_2px_rgba(64,45,135,0.2)] before:content-[''] before:absolute before:top-[-0.5rem] before:left-[-1.25rem] before:right-[-1.25rem] before:h-px before:bg-linear-to-r before:from-transparent before:via-black/6 before:to-transparent">
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
              {isCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className={cn(
                        'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 cursor-pointer bg-transparent border-none justify-center py-4 px-3',
                        'hover:text-[#402D87]',
                      )}
                    >
                      <Icon
                        icon="bi:box-arrow-right"
                        className="w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d] hover:scale-110 hover:rotate-2 hover:text-[#402D87]"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              ) : (
                <button
                  onClick={handleLogout}
                  className={cn(
                    'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 cursor-pointer bg-transparent border-none',
                    'hover:text-[#402D87]',
                  )}
                >
                  <Icon
                    icon="bi:box-arrow-right"
                    className="w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d] hover:scale-110 hover:rotate-2 hover:text-[#402D87]"
                  />
                  <span>Logout</span>
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  )
}
