import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUserProfile } from '@/hooks'
import { extractRequestIdFromResponse, resolveRequestInboxRole } from '@/utils/requestEntity'
import { buildRequestViewUrl, buildRequestsInboxUrl } from '@/utils/requestNavigation'

/** Navigate initiators to their request inbox after a gated mutation returns request_id. */
export function useRequestInitiatorNavigation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfile } = useGetUserProfileService()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const inboxRole = resolveRequestInboxRole(userProfile?.user_type, vendorIdFromUrl)

  const goToSubmittedRequest = useCallback(
    (response: unknown): boolean => {
      const requestId = extractRequestIdFromResponse(response)
      if (!requestId) return false
      navigate(
        buildRequestViewUrl(
          inboxRole,
          { id: requestId, request_id: requestId },
          { vendorId: vendorIdFromUrl },
        ),
      )
      return true
    },
    [navigate, inboxRole, vendorIdFromUrl],
  )

  const goToRequestsInbox = useCallback(
    (options?: { pendingOnly?: boolean }) => {
      navigate(
        buildRequestsInboxUrl(inboxRole, {
          vendorId: vendorIdFromUrl,
          pendingOnly: options?.pendingOnly,
        }),
      )
    },
    [navigate, inboxRole, vendorIdFromUrl],
  )

  return { goToSubmittedRequest, goToRequestsInbox, inboxRole }
}
