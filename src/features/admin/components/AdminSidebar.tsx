import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs'

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Get admin name from JWT decoded user or default
  const userName =
    (user as any)?.name || (user as any)?.fullname || (user as any)?.email?.split('@')[0] || 'Admin'

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('adminSidebarCollapsed', newState.toString())
  }

  const handleLogout = async () => {
    logout()
    navigate(ROUTES.IN_APP.ADMIN.AUTH.LOGIN)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setIsCollapsed(true)
      } else {
        const savedState = localStorage.getItem('adminSidebarCollapsed')
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
    if (path === ROUTES.IN_APP.ADMIN.HOME) {
      return location.pathname === path
    }
    // For exact matches
    if (location.pathname === path) {
      return true
    }
    // For prefix matches
    if (location.pathname.startsWith(path + '/')) {
      return true
    }
    return false
  }

  const adminNavItems = [
    {
      section: 'Overview',
      items: [
        { path: ROUTES.IN_APP.ADMIN.HOME, label: 'Dashboard', icon: 'bi:speedometer2' },
      ],
    },
    {
      section: 'User Management',
      items: [
        {
          path: ROUTES.IN_APP.ADMIN.CUSTOMERS,
          label: 'Customers',
          icon: 'bi:people-fill',
        },
        {
          path: ROUTES.IN_APP.ADMIN.VENDORS,
          label: 'Vendors',
          icon: 'bi:shop',
        },
        {
          path: ROUTES.IN_APP.ADMIN.MERCHANTS,
          label: 'Merchants',
          icon: 'bi:shop',
        },
      ],
    },
    {
      section: 'Admin Management',
      items: [
        {
          path: ROUTES.IN_APP.ADMIN.ADMINS,
          label: 'Admins',
          icon: 'bi:person-check-fill',
        },
        {
          path: ROUTES.IN_APP.ADMIN.ROLES,
          label: 'Roles & Permissions',
          icon: 'bi:shield-lock-fill',
        },
        {
          path: ROUTES.IN_APP.ADMIN.ARCHIVED,
          label: 'Archived',
          icon: 'bi:archive-fill',
        },
      ],
    },
    {
      section: 'Transactions',
      items: [
        {
          path: ROUTES.IN_APP.ADMIN.TRANSACTIONS,
          label: 'All Transactions',
          icon: 'bi:receipt',
        },
        {
          path: ROUTES.IN_APP.ADMIN.PENDING_LIMITS,
          label: 'Pending Limits',
          icon: 'bi:clock-history',
        },
      ],
    },
    {
      section: 'Settings & Support',
      items: [
        {
          path: ROUTES.IN_APP.ADMIN.PROFILE,
          label: 'Profile',
          icon: 'bi:person-circle',
        },
        {
          path: ROUTES.IN_APP.ADMIN.SETTINGS,
          label: 'Settings',
          icon: 'bi:gear-fill',
        },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'bg-white flex flex-col w-[380px] transition-all duration-300 ease-in-out',
        'shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.04)]',
        'border-r border-black/8 min-h-full h-auto flex-shrink-0 relative z-[5]',
        'max-lg:hidden',
        isCollapsed && 'w-[90px] flex-shrink-0',
      )}
    >
      <div className="flex flex-col flex-grow min-h-full h-full overflow-hidden relative z-[2] p-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 mb-6 border-b border-black/6 bg-white relative z-[1]">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#402D87] to-[#2d1a72] flex items-center justify-center text-white text-xl shadow-[0_4px_12px_rgba(64,45,135,0.25)] transition-all duration-300 hover:translate-y-[-1px] hover:shadow-[0_6px_16px_rgba(64,45,135,0.35)]">
                <Icon icon="bi:shield-check" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-[#2c3e50] m-0 mb-1 whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                  {userName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[#6c757d] font-medium bg-[#f8f9fa] px-3 py-1 rounded-full border border-[#e9ecef] w-fit">
                  <Icon icon="bi:shield-lock" className="text-xs text-[#402D87]" />
                  <span>Admin Account</span>
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

        {/* Navigation */}
        <nav className="flex-grow relative z-[1]">
          <ul className="list-none p-0 m-0 px-5">
            {adminNavItems.map((section) => (
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
                        'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-[1px]',
                      isCollapsed && 'justify-center mb-3',
                    )}
                  >
                    {isActive(item.path) && (
                      <>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/30 via-[#402D87] to-[#2d1a72] rounded-r-sm shadow-[2px_0_8px_rgba(64,45,135,0.4),2px_0_16px_rgba(64,45,135,0.2)]" />
                        <div className="absolute inset-0 rounded-r-2xl bg-gradient-to-br from-white/8 via-transparent to-[rgba(45,26,114,0.03)] pointer-events-none" />
                      </>
                    )}
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-[2]',
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
                !isCollapsed && 'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-[1px]',
                isCollapsed && 'justify-center mb-3',
              )}
            >
              <button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-[2] cursor-pointer bg-transparent border-none',
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

