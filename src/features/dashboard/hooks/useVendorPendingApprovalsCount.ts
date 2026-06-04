import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useUserProfile } from '@/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import {
  countPendingRequestsForContext,
  parseRequestsListResponse,
} from '@/utils/requestStatus'
import type { RequestApprovalContext } from '@/types/requests'

/** Pending vendor requests the current user can approve (sidebar badge, bell, dashboard). */
export function useVendorPendingApprovalsCount(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const { useGetRequestsVendorService } = vendorQueries()
  const { useGetRequestsCorporateSuperAdminVendorService } = corporateQueries()

  const vendorQueryEnabled =
    enabled && (!isCorporateSuperAdmin || Boolean(vendorIdFromUrl))

  const { data: vendorRequestsResponse, isLoading: isLoadingVendorRequests } =
    useGetRequestsVendorService(
      vendorQueryEnabled ? { limit: 100 } : undefined,
    )

  const { data: corporateVendorRequestsResponse, isLoading: isLoadingCorporateVendorRequests } =
    useGetRequestsCorporateSuperAdminVendorService(
      enabled && isCorporateSuperAdmin && vendorIdFromUrl ? vendorIdFromUrl : null,
    )

  const requestsResponse =
    isCorporateSuperAdmin && vendorIdFromUrl
      ? corporateVendorRequestsResponse
      : vendorRequestsResponse

  const approvalContext: RequestApprovalContext =
    isCorporateSuperAdmin && vendorIdFromUrl ? 'corporate-vendor-scoped' : 'vendor'

  const pendingCount = useMemo(() => {
    if (!enabled) return 0
    return countPendingRequestsForContext(
      parseRequestsListResponse(requestsResponse),
      approvalContext,
    )
  }, [requestsResponse, approvalContext, enabled])

  const isLoading =
    enabled &&
    (isCorporateSuperAdmin && vendorIdFromUrl
      ? isLoadingCorporateVendorRequests
      : isLoadingVendorRequests)

  return {
    pendingCount,
    isLoading,
    approvalContext,
    vendorIdFromUrl,
    isCorporateSuperAdmin,
  }
}
