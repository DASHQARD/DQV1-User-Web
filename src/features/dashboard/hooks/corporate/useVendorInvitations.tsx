import React, { useCallback, useMemo } from 'react'
import { useReducerSpread } from '@/hooks'
import { corporateQueries } from '../../corporate/hooks'
import { DEFAULT_QUERY } from '@/utils/constants'

export function useVendorInvitations() {
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  const { useGetVendorInvitationsService } = corporateQueries()

  const queryParams = React.useMemo(() => {
    const params: Record<string, any> = {
      limit: query.limit || 10,
    }
    if (query.after) params.after = query.after
    if (query.search) params.search = query.search
    if (query.status) params.status = query.status
    if (query.dateFrom) params.dateFrom = query.dateFrom
    if (query.dateTo) params.dateTo = query.dateTo
    return params
  }, [query])

  const { data: response, isLoading } = useGetVendorInvitationsService(queryParams)

  const invitationList = React.useMemo(() => {
    if (!response) return []
    return Array.isArray(response?.data) ? response.data : []
  }, [response])

  const pagination = response?.pagination

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
      ? invitationList.length + (Number(query.limit) || 10)
      : invitationList.length
  }, [pagination?.hasNextPage, invitationList.length, query.limit])

  return {
    query,
    setQuery,
    invitationList,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  }
}
