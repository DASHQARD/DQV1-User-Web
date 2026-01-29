import { useMemo, useCallback } from 'react'
import { Text, PaginatedTable, Button } from '@/components'
import {
  branchManagerInvitationsListCsvHeaders,
  branchManagerInvitationsListColumns,
} from '@/features/dashboard/components/vendors/tableConfigs'
import {
  CancelBranchManagerInvitationModal,
  DeleteBranchManagerInvitationModal,
  InviteBranchManagerModal,
  RemoveBranchManagerModal,
  UpdateBranchManagerInvitationModal,
} from '@/features/dashboard/components/vendors/modals'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType, GetBranchManagerInvitationsQuery } from '@/types'
import { useReducerSpread, useUserProfile } from '@/hooks'
import { vendorQueries } from '../../hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

export default function BranchManagers() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'

  const apiQuery = useMemo((): GetBranchManagerInvitationsQuery => {
    const params: GetBranchManagerInvitationsQuery = {
      limit: Number(query.limit) || 10,
    }
    if (query.after) params.after = query.after
    if (query.search) params.search = query.search
    if ((query as any).status) params.status = (query as any).status
    if (query.dateFrom) params.dateFrom = query.dateFrom
    if (query.dateTo) params.dateTo = query.dateTo
    return params
  }, [query])

  const { useGetBranchManagerInvitationsService } = vendorQueries()
  const { useGetCorporateBranchManagerInvitationsService } = corporateQueries()

  const { data: vendorInvitationsResponse, isLoading: isLoadingVendorInvitations } =
    useGetBranchManagerInvitationsService(isCorporateSuperAdmin ? undefined : apiQuery)

  const { data: corporateInvitationsResponse, isLoading: isLoadingCorporateInvitations } =
    useGetCorporateBranchManagerInvitationsService(isCorporateSuperAdmin ? apiQuery : undefined)

  const invitationsResponse = isCorporateSuperAdmin
    ? corporateInvitationsResponse
    : vendorInvitationsResponse
  const isLoadingInvitations = isCorporateSuperAdmin
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

  return (
    <div className="py-10">
      <CancelBranchManagerInvitationModal />
      <DeleteBranchManagerInvitationModal />
      <InviteBranchManagerModal />
      <RemoveBranchManagerModal />
      <UpdateBranchManagerInvitationModal />
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Branch Managers
          </Text>
          {isCorporateSuperAdmin && (
            <Button
              variant="secondary"
              onClick={() =>
                inviteModal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CREATE)
              }
              className="flex items-center gap-2"
            >
              <Icon icon="bi:person-plus-fill" className="text-lg" />
              Invite Branch Manager
            </Button>
          )}
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={branchManagerInvitationsListColumns}
            data={invitations}
            total={estimatedTotal}
            loading={isLoadingInvitations}
            query={query}
            setQuery={setQuery}
            searchPlaceholder="Search by email or name..."
            csvHeaders={branchManagerInvitationsListCsvHeaders}
            printTitle="Branch Manager Invitations"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
