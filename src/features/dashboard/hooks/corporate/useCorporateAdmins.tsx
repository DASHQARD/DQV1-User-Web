import { useReducerSpread } from '@/hooks'
import { useMemo } from 'react'
import { corporateQueries } from '../../corporate/hooks'
import { useAuthStore } from '@/stores'
import { usePersistedModalState } from '@/hooks'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import AllAdmins from '../../components/corporate/admins/AllAdmins'
import InvitedAdmins from '../../components/corporate/admins/InvitedAdmins'

export function useCorporateAdmins() {
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  const user = useAuthStore().user
  const { useGetCorporateAdminsService, useGetInvitedCorporateAdminsService } = corporateQueries()

  // Build params for the API call
  const params = useMemo(() => {
    const apiParams: any = {
      limit: query.limit || 10,
    }
    if (query.after) {
      apiParams.after = query.after
    }
    if (query.search) {
      apiParams.search = query.search
    }
    return apiParams
  }, [query])

  const { data: corporateAdminsResponse, isLoading: isLoadingCorporateAdminsList } =
    useGetCorporateAdminsService(params)
  const { data: invitedCorporateAdminsList, isLoading: isLoadingInvitedCorporateAdminsList } =
    useGetInvitedCorporateAdminsService()

  // Extract data and pagination from response
  const corporateAdminsList = corporateAdminsResponse?.data || []
  const pagination = corporateAdminsResponse?.pagination

  const corporateAdminTabConfigs = [
    {
      key: 'all-admins' as const,
      component: () => <AllAdmins />,
      label: 'All admins',
    },
    {
      key: 'invited-admins' as const,
      component: () => <InvitedAdmins />,
      label: 'Invited admins',
    },
  ]

  function getCorporateAdminOptions({
    modal: modalInstance,
    requestCorporate,
    option,
    loginUser,
    userPermissions: providedPermissions,
  }: {
    modal: ReturnType<typeof usePersistedModalState>
    requestCorporate: any
    option: {
      hasView?: boolean
      hasApprove?: boolean
      hasReject?: boolean
    }
    loginUser: any
    userPermissions: string[]
  }) {
    if (!requestCorporate) return []

    const actions = []
    const permissionsToCheck = providedPermissions || []
    const userToCheck = loginUser || user

    // View option
    if (
      option?.hasView &&
      (permissionsToCheck.some(
        (p) =>
          p.toLowerCase().includes('corporates:view') ||
          p.toLowerCase().includes('corporate management view'),
      ) ||
        userToCheck?.isSuperAdmin)
    ) {
      actions.push({
        label: 'View',
        onClickFn: () =>
          modalInstance.openModal(
            MODALS.REQUEST_CORPORATE_MANAGEMENT.CHILDREN.VIEW,
            requestCorporate,
          ),
      })
    }

    // Approve option - only show if status is not already approved
    if (
      option?.hasApprove &&
      requestCorporate.status?.toLowerCase() !== 'approved' &&
      (permissionsToCheck.some(
        (p) =>
          p.toLowerCase().includes('corporates:manage') ||
          p.toLowerCase().includes('corporate management deactivate/activate'),
      ) ||
        userToCheck?.isSuperAdmin)
    ) {
      actions.push({
        label: 'Approve Request',
        onClickFn: () => {
          modalInstance.openModal(MODALS.REQUEST_CORPORATE_MANAGEMENT.CHILDREN.APPROVE, {
            id: String(requestCorporate.id),
            status: 'approved',
          })
        },
      })
    }

    // Reject option - only show if status is not already rejected
    if (
      option?.hasReject &&
      requestCorporate.status?.toLowerCase() !== 'rejected' &&
      (permissionsToCheck.some(
        (p) =>
          p.toLowerCase().includes('corporates:manage') ||
          p.toLowerCase().includes('corporate management deactivate/activate'),
      ) ||
        userToCheck?.isSuperAdmin)
    ) {
      actions.push({
        label: 'Reject Request',
        onClickFn: () =>
          modalInstance.openModal(MODALS.REQUEST_CORPORATE_MANAGEMENT.CHILDREN.REJECT, {
            id: String(requestCorporate.id),
            status: 'rejected',
          }),
      })
    }

    return actions
  }

  return {
    query,
    corporateAdminsList,
    pagination,
    getCorporateAdminOptions,
    isLoadingCorporateAdminsList,
    setQuery,
    corporateAdminTabConfigs,
    modal,
    invitedCorporateAdminsList,
    isLoadingInvitedCorporateAdminsList,
  }
}
