import { useReducerSpread } from '@/hooks'

import { corporateQueries } from '../../corporate/hooks'
import { useAuthStore } from '@/stores'
// import React from 'react'
import { usePersistedModalState } from '@/hooks'
// import { useSearch } from '@/hooks/useSearch'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'

export function useCorporateRequests() {
  //   const { state } = useSearch()

  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  //   const { userPermissions = [] } = useContentGuard()

  const user = useAuthStore().user

  //   React.useEffect(() => {
  //     if (state?.searchQuery) {
  //       setQuery({ ...query, page: 1, search: state.searchQuery.trim() })
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, [setQuery, state?.searchQuery])

  const { useGetRequestsCorporateService } = corporateQueries()
  const { data: requestCorporatesList, isLoading: isLoadingRequestCorporatesList } =
    useGetRequestsCorporateService()

  function getRequestCorporateOptions({
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
    requestCorporatesList,
    getRequestCorporateOptions,
    isLoadingRequestCorporatesList,
    setQuery,
  }
}
