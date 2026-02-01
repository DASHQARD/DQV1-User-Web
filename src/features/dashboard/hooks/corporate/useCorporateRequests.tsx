import React, { useCallback, useMemo } from 'react'
import { useReducerSpread } from '@/hooks'
import { corporateQueries } from '../../corporate/hooks'
import { useAuthStore } from '@/stores'
import { usePersistedModalState } from '@/hooks'
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

  const queryParams = React.useMemo(() => {
    const params: Record<string, any> = {
      limit: query.limit || 10,
    }
    if (query.after) params.after = query.after
    if (query.search) params.search = query.search
    if (query.status) params.status = query.status
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: requestsResponse, isLoading: isLoadingRequestCorporatesList } =
    useGetRequestsCorporateService(queryParams)

  const requestCorporatesList = React.useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse?.data) ? requestsResponse.data : []
  }, [requestsResponse])

  const pagination = requestsResponse?.pagination

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

  const estimatedTotal = useMemo(
    () =>
      pagination?.hasNextPage
        ? requestCorporatesList.length + (Number(query.limit) || 10)
        : requestCorporatesList.length,
    [pagination?.hasNextPage, requestCorporatesList.length, query.limit],
  )

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
    pagination,
    getRequestCorporateOptions,
    isLoadingRequestCorporatesList,
    setQuery,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  }
}
