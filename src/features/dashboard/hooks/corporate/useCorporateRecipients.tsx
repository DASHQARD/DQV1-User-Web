import { useCallback, useMemo } from 'react'
import { useReducerSpread } from '@/hooks'
import { usePersistedModalState } from '@/hooks'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { corporateQueries } from '../../corporate/hooks'

export function useCorporateRecipients() {
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT,
  })
  const { useGetAllRecipientsService } = corporateQueries()

  const params = useMemo(() => {
    const apiParams: Record<string, any> = {
      limit: query.limit || 10,
    }
    if (query.after) apiParams.after = query.after
    if (query.search) apiParams.search = query.search
    return apiParams
  }, [query])

  const { data: recipientsResponse, isLoading } = useGetAllRecipientsService(params)
  const recipientsData = recipientsResponse?.data || []
  const pagination = recipientsResponse?.pagination

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination?.hasNextPage, pagination?.next, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  const estimatedTotal = useMemo(
    () =>
      pagination?.hasNextPage
        ? recipientsData.length + (Number(query.limit) || 10)
        : recipientsData.length,
    [pagination?.hasNextPage, recipientsData.length, query.limit],
  )

  const handleOpenCreateModal = useCallback(() => {
    modal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT)
  }, [modal])

  return {
    query,
    setQuery,
    modal,
    handleOpenCreateModal,
    recipientsData,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  }
}
