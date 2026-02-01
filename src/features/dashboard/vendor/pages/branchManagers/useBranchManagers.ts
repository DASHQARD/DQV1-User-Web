import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePersistedModalState, useReducerSpread, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType, GetBranchManagerInvitationsQuery } from '@/types'
import { vendorQueries } from '../../hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

export function useBranchManagers() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const isCorporateSwitchedToVendor = isCorporateSuperAdmin && !!vendorIdFromUrl

  const apiQuery = useMemo((): GetBranchManagerInvitationsQuery & { vendor_id?: string } => {
    const params: GetBranchManagerInvitationsQuery & { vendor_id?: string } = {
      limit: Number(query.limit) || 10,
    }
    if (query.after) params.after = query.after
    if (query.search) params.search = query.search
    if ((query as any).status) params.status = (query as any).status
    if (query.dateFrom) params.dateFrom = query.dateFrom
    if (query.dateTo) params.dateTo = query.dateTo
    if (isCorporateSwitchedToVendor && vendorIdFromUrl) params.vendor_id = vendorIdFromUrl
    return params
  }, [query, isCorporateSwitchedToVendor, vendorIdFromUrl])

  const { useGetBranchManagerInvitationsService } = vendorQueries()
  const {
    useGetCorporateSuperAdminBranchManagersService,
    useGetCorporateBranchManagerInvitationsService,
  } = corporateQueries()

  const { data: vendorInvitationsResponse, isLoading: isLoadingVendorInvitations } =
    useGetBranchManagerInvitationsService(isCorporateSuperAdmin ? undefined : apiQuery)

  const {
    data: corporateSuperAdminBranchManagersResponse,
    isLoading: isLoadingCorporateSuperAdminBranchManagers,
  } = useGetCorporateSuperAdminBranchManagersService(
    isCorporateSwitchedToVendor ? vendorIdFromUrl : null,
    isCorporateSwitchedToVendor ? apiQuery : undefined,
  )

  const { data: corporateInvitationsResponse, isLoading: isLoadingCorporateInvitations } =
    useGetCorporateBranchManagerInvitationsService(
      isCorporateSuperAdmin && !vendorIdFromUrl ? apiQuery : undefined,
    )

  const invitationsResponse = isCorporateSwitchedToVendor
    ? corporateSuperAdminBranchManagersResponse
    : isCorporateSuperAdmin
      ? corporateInvitationsResponse
      : vendorInvitationsResponse

  const isLoadingInvitations = isCorporateSwitchedToVendor
    ? isLoadingCorporateSuperAdminBranchManagers
    : isCorporateSuperAdmin
      ? isLoadingCorporateInvitations
      : isLoadingVendorInvitations

  const inviteModal = usePersistedModalState({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })

  const invitations = useMemo(() => {
    if (!invitationsResponse) return []
    return Array.isArray(invitationsResponse?.data) ? invitationsResponse.data : []
  }, [invitationsResponse])

  const pagination = invitationsResponse?.pagination

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  const estimatedTotal = useMemo(() => {
    return pagination?.hasNextPage
      ? invitations.length + (Number(query.limit) || 10)
      : invitations.length
  }, [pagination, invitations.length, query.limit])

  const openInviteModal = useCallback(() => {
    inviteModal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CREATE)
  }, [inviteModal])

  return {
    query,
    setQuery,
    isCorporateSuperAdmin,
    inviteModal,
    invitations,
    isLoadingInvitations,
    pagination,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
    openInviteModal,
  }
}
