import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon, cn } from '@/libs'
import { Text, Tag, Tooltip, TooltipTrigger, TooltipContent, Loader } from '@/components'
import { ROUTES } from '@/utils/constants'
import { useUserProfile } from '@/hooks'
import { getStatusVariant } from '@/utils/helpers'
import { corporateQueries } from '../../corporate'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { formatDate } from '@/utils/format'
import { useVendorOnboardingProgress } from '@/features/dashboard/hooks/useVendorOnboardingProgress'
import { VENDOR_NAV_DISABLED_TOOLTIP } from '@/features/dashboard/components/sidebar/VendorSidebarNavItem'
import { parseRequestsListResponse } from '@/utils/requestStatus'
import { useVendorPendingApprovalsCount } from '@/features/dashboard/hooks/useVendorPendingApprovalsCount'

const LIST_LIMIT = 5

type RequestRow = {
  id?: string | number
  request_id?: string
  type?: string
  status?: string
  description?: string
  name?: string
  created_at?: string
}

export default function RecentRequests() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetRequestsVendorService } = vendorQueries()
  const { useGetRequestsCorporateSuperAdminVendorService } = corporateQueries()

  const { data: vendorRequestsResponse, isLoading: isLoadingVendorRequests } =
    useGetRequestsVendorService(
      isCorporateSuperAdmin && !vendorIdFromUrl ? undefined : { limit: 100 },
    )
  const { data: corporateVendorRequestsResponse, isLoading: isLoadingCorporateVendorRequests } =
    useGetRequestsCorporateSuperAdminVendorService(
      isCorporateSuperAdmin && vendorIdFromUrl ? vendorIdFromUrl : null,
    )

  const requestsResponse =
    isCorporateSuperAdmin && vendorIdFromUrl
      ? corporateVendorRequestsResponse
      : vendorRequestsResponse

  const isLoading =
    isCorporateSuperAdmin && vendorIdFromUrl
      ? isLoadingCorporateVendorRequests
      : isLoadingVendorRequests

  const { getIsNavItemDisabled } = useVendorOnboardingProgress()
  const isRequestsDisabled = getIsNavItemDisabled(ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS)

  const allRequests = useMemo(
    () => parseRequestsListResponse(requestsResponse) as RequestRow[],
    [requestsResponse],
  )

  const previewRequests = useMemo(() => allRequests.slice(0, LIST_LIMIT), [allRequests])

  const { pendingCount } = useVendorPendingApprovalsCount()

  const requestsHref = `${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?account=vendor${
    vendorIdFromUrl ? `&vendor_id=${vendorIdFromUrl}` : ''
  }`

  const viewAllLink = isRequestsDisabled ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-gray-400 text-sm font-medium flex items-center cursor-not-allowed">
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{VENDOR_NAV_DISABLED_TOOLTIP}</TooltipContent>
    </Tooltip>
  ) : (
    <Link
      to={requestsHref}
      className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
    >
      View all <Icon icon="bi:arrow-right" className="ml-1" />
    </Link>
  )

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center gap-2 flex-wrap">
          <span className="flex items-center">
            <Icon icon="bi:clipboard-check" className="text-[#402D87] mr-2" />
            Requests
            {allRequests.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({allRequests.length})</span>
            )}
          </span>
          {pendingCount > 0 && (
            <span
              className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-semibold px-1.5"
              aria-label={`${pendingCount} pending approval`}
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </h5>
        {viewAllLink}
      </div>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        ) : previewRequests.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Icon icon="bi:inbox" className="text-6xl text-[#e9ecef] mb-3" />
            <Text variant="p" className="text-sm text-[#6c757d] m-0">
              No requests to display
            </Text>
          </div>
        ) : (
          <div className="space-y-3">
            {previewRequests.map((request) => {
              const requestId = request.request_id || `RQ-${request.id}`
              const rowClassName = cn(
                'flex items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg',
                isRequestsDisabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-gray-50 transition-colors group',
              )

              const rowContent = (
                <>
                  <div className="w-10 h-10 rounded-lg bg-[#402D87]/10 flex items-center justify-center shrink-0">
                    <Icon icon="bi:clipboard-check" className="text-[#402D87]" />
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="min-w-0">
                      <Text
                        variant="span"
                        weight="semibold"
                        className="text-gray-900 block truncate"
                      >
                        {requestId}
                      </Text>
                      <Text variant="span" className="text-xs text-gray-500 block mt-0.5 truncate">
                        {request.type || 'N/A'}
                      </Text>
                      <Text variant="span" className="text-xs text-gray-400 block mt-2">
                        {request.created_at ? formatDate(request.created_at) : '—'}
                      </Text>
                    </div>
                    <div className="min-w-0">
                      <Text variant="span" className="text-sm text-gray-900 block line-clamp-2">
                        {request.description || 'No description'}
                      </Text>
                      <Text variant="span" className="text-xs text-gray-500 block mt-1 truncate">
                        {request.name || 'Unknown'}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {request.status ? (
                      <Tag value={request.status} variant={getStatusVariant(request.status)} />
                    ) : null}
                    <Icon
                      icon="bi:chevron-right"
                      className={cn(
                        'text-gray-400 transition-colors hidden sm:block',
                        !isRequestsDisabled && 'group-hover:text-[#402D87]',
                      )}
                    />
                  </div>
                </>
              )

              if (isRequestsDisabled) {
                return (
                  <Tooltip key={String(request.id ?? requestId)}>
                    <TooltipTrigger asChild>
                      <div className={rowClassName}>{rowContent}</div>
                    </TooltipTrigger>
                    <TooltipContent>{VENDOR_NAV_DISABLED_TOOLTIP}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link
                  key={String(request.id ?? requestId)}
                  to={requestsHref}
                  className={rowClassName}
                >
                  {rowContent}
                </Link>
              )
            })}

            {allRequests.length > LIST_LIMIT ? (
              <div className="text-center pt-2">
                {isRequestsDisabled ? (
                  <span className="text-gray-400 text-sm font-medium cursor-not-allowed">
                    View all {allRequests.length} requests
                  </span>
                ) : (
                  <Link
                    to={requestsHref}
                    className="text-[#402D87] text-sm font-medium hover:text-[#2d1a72] transition-colors"
                  >
                    View all {allRequests.length} requests
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
