import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/libs'
import { USER_NAV_ITEMS, ROUTES } from '@/utils/constants'
import { cn } from '@/libs'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import Sidebar from './Sidebar'

export default function UserSidebar() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    if (location.pathname === path) {
      return true
    }
    if (location.pathname.startsWith(path + '/')) {
      if (path === ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT) {
        return !location.pathname.startsWith(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH)
      }
      return true
    }
    return false
  }

  return (
    <Sidebar
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      accountLabel="Personal Account"
    >
      {USER_NAV_ITEMS.map((section) => (
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
                !isActive(item.path) && 'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
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
                      to={item.path}
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
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  to={item.path}
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
    </Sidebar>
  )
}
