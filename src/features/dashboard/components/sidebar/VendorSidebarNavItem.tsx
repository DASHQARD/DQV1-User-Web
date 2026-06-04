import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import { ROUTES } from '@/utils/constants'

export const VENDOR_NAV_DISABLED_TOOLTIP =
  'Complete vendor setup to access this section'

type VendorNavItem = {
  path: string
  label: string
  icon: string
}

type VendorSidebarNavItemProps = {
  item: VendorNavItem
  isDisabled: boolean
  isCollapsed: boolean
  isActive: (path: string) => boolean
  addAccountParam: (path: string) => string
  pendingRequestsCount?: number
}

function formatNavItemLabel(item: VendorNavItem, pendingRequestsCount: number): string {
  if (
    item.path === ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS &&
    pendingRequestsCount > 0
  ) {
    const count = pendingRequestsCount > 99 ? '99+' : String(pendingRequestsCount)
    return `${item.label} (${count})`
  }
  return item.label
}

export function VendorSidebarNavItem({
  item,
  isDisabled,
  isCollapsed,
  isActive,
  addAccountParam,
  pendingRequestsCount = 0,
}: VendorSidebarNavItemProps) {
  const active = isActive(item.path) && !isDisabled
  const showRequestsBadge =
    item.path === ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS && pendingRequestsCount > 0
  const navLabel = formatNavItemLabel(item, pendingRequestsCount)

  return (
    <li
      className={cn(
        'flex items-center mb-2 rounded-[10px] transition-all duration-200 relative overflow-hidden',
        active &&
          'bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] rounded-l-none rounded-r-[10px] shadow-[0_2px_8px_rgba(64,45,135,0.1)]',
        !active && !isDisabled && 'hover:bg-[rgba(64,45,135,0.04)] hover:translate-x-px',
        isCollapsed && 'justify-center mb-3',
        isDisabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {active && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-white/30 via-[#402D87] to-[#2d1a72] rounded-r-sm shadow-[2px_0_8px_rgba(64,45,135,0.4),2px_0_16px_rgba(64,45,135,0.2)]" />
          <div className="absolute inset-0 rounded-r-2xl bg-linear-to-br from-white/8 via-transparent to-[rgba(45,26,114,0.03)] pointer-events-none" />
        </>
      )}
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {isDisabled ? (
              <div
                className={cn(
                  'flex items-center gap-3.5 text-gray-400 font-medium text-sm py-3 px-4 w-full rounded-[10px] relative z-2 justify-center cursor-not-allowed',
                )}
              >
                <Icon
                  icon={item.icon}
                  className="w-5 h-5 text-base flex items-center justify-center shrink-0 text-gray-400"
                />
              </div>
            ) : (
              <Link
                to={addAccountParam(item.path)}
                className={cn(
                  'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2 justify-center',
                  active && 'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                  !active && 'hover:text-[#402D87]',
                )}
              >
                <span className="relative inline-flex">
                  <Icon
                    icon={item.icon}
                    className={cn(
                      'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                      active && 'text-[#402D87]',
                      !active &&
                        'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                    )}
                  />
                  {showRequestsBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1">
                      {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
                    </span>
                  )}
                </span>
              </Link>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            {isDisabled
              ? `${navLabel} — ${VENDOR_NAV_DISABLED_TOOLTIP}`
              : navLabel}
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          {isDisabled ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'flex items-center gap-3.5 text-gray-400 font-medium text-sm py-3 px-4 w-full rounded-[10px] relative z-2 cursor-not-allowed',
                  )}
                >
                  <Icon
                    icon={item.icon}
                    className="w-5 h-5 text-base flex items-center justify-center shrink-0 text-gray-400"
                  />
                  <span className="flex-1">{navLabel}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {navLabel} — {VENDOR_NAV_DISABLED_TOOLTIP}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to={addAccountParam(item.path)}
              className={cn(
                'flex items-center gap-3.5 no-underline text-[#495057] font-medium text-sm py-3 px-4 w-full transition-all duration-200 rounded-[10px] relative z-2',
                active && 'text-[#402D87] font-bold [text-shadow:0_1px_2px_rgba(64,45,135,0.2)]',
                !active && 'hover:text-[#402D87]',
              )}
            >
              <Icon
                icon={item.icon}
                className={cn(
                  'w-5 h-5 text-base flex items-center justify-center transition-all duration-200 shrink-0 text-[#6c757d]',
                  active && 'text-[#402D87]',
                  !active &&
                    'hover:scale-110 hover:rotate-2 hover:text-[#402D87] hover:filter-[drop-shadow(0_2px_4px_rgba(64,45,135,0.3))]',
                )}
              />
              <span className="flex-1">{navLabel}</span>
            </Link>
          )}
        </>
      )}
      {isCollapsed && active && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-linear-to-b from-[#402D87] to-[#2d1a72] rounded-l-sm" />
      )}
    </li>
  )
}
