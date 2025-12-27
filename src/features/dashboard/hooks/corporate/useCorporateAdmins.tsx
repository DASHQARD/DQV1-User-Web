import { useReducerSpread } from '@/hooks'

import { corporateQueries } from '../../corporate/hooks'
import { useAuthStore } from '@/stores'
// import React from 'react'
import { usePersistedModalState } from '@/hooks'
// import { useSearch } from '@/hooks/useSearch'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import AllAdmins from '../../components/corporate/admins/AllAdmins'
import InvitedAdmins from '../../components/corporate/admins/InvitedAdmins'

export function useCorporateAdmins() {
  //   const { state } = useSearch()
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  //   const { userPermissions = [] } = useContentGuard()

  const user = useAuthStore().user

  //   React.useEffect(() => {
  //     if (state?.searchQuery) {
  //       setQuery({ ...query, page: 1, search: state.searchQuery.trim() })
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [setQuery, state?.searchQuery])

  const { useGetCorporateAdminsService, useGetInvitedCorporateAdminsService } = corporateQueries()
  const { data: corporateAdminsList, isLoading: isLoadingCorporateAdminsList } =
    useGetCorporateAdminsService()
  const { data: invitedCorporateAdminsList, isLoading: isLoadingInvitedCorporateAdminsList } =
    useGetInvitedCorporateAdminsService()

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
    getCorporateAdminOptions,
    isLoadingCorporateAdminsList,
    setQuery,
    corporateAdminTabConfigs,
    modal,
    invitedCorporateAdminsList,
    isLoadingInvitedCorporateAdminsList,
  }
}
