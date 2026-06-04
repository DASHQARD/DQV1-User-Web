import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { useVendorPendingApprovalsCount } from '@/features/dashboard/hooks/useVendorPendingApprovalsCount'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components'
import { VENDOR_NAV_DISABLED_TOOLTIP } from '@/features/dashboard/components/sidebar/VendorSidebarNavItem'

type VendorPendingApprovalsBellProps = {
  enabled?: boolean
  className?: string
}

export function VendorPendingApprovalsBell({
  enabled = true,
  className,
}: VendorPendingApprovalsBellProps) {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { pendingCount, isLoading } = useVendorPendingApprovalsCount({ enabled })
  const { getIsNavItemDisabled } = useVendorOnboardingProgress()
  const isRequestsDisabled = getIsNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS)

  const requestsHref = `${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?account=vendor${
    vendorIdFromUrl ? `&vendor_id=${vendorIdFromUrl}` : ''
  }`

  const label =
    pendingCount === 1
      ? '1 approval needs your attention'
      : `${pendingCount} approvals need your attention`

  const bellButton = (
    <span className="relative inline-flex p-2 text-gray-600">
      <Icon icon="bi:bell" className="w-5 h-5" aria-hidden />
      {!isLoading && pendingCount > 0 && (
        <span
          className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-1"
          aria-hidden
        >
          {pendingCount > 99 ? '99+' : pendingCount}
        </span>
      )}
    </span>
  )

  if (isRequestsDisabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn('inline-flex cursor-not-allowed opacity-50', className)}
            aria-label="Approvals unavailable"
          >
            {bellButton}
          </span>
        </TooltipTrigger>
        <TooltipContent>{VENDOR_NAV_DISABLED_TOOLTIP}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to={requestsHref}
          className={cn(
            'inline-flex rounded-md hover:bg-gray-100 transition-colors no-underline',
            className,
          )}
          aria-label={pendingCount > 0 ? label : 'View requests'}
          title={pendingCount > 0 ? label : 'View requests'}
        >
          {bellButton}
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        {pendingCount > 0 ? label : 'View requests'}
      </TooltipContent>
    </Tooltip>
  )
}
