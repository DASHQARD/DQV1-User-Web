import { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { usePersistedModalState, useReducerSpread } from '@/hooks'
import { useAuthStore } from '@/stores'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { PastPurchase } from '../../components/corporate/purchase'
import { corporateQueries } from '../../corporate/hooks'

export function usePurchaseManagement() {
  const [query, setQuery] = useReducerSpread(DEFAULT_QUERY)
  const user = useAuthStore().user
  const location = useLocation()
  const currentTab = new URLSearchParams(location.search).get('tab') || 'bulk'

  const purchaseModal = usePersistedModalState({
    paramName: MODALS.PURCHASE.PARAM_NAME,
  })

  const bulkPurchaseModal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  const handleBulkPurchase = useCallback(() => {
    bulkPurchaseModal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)
  }, [bulkPurchaseModal])

  const { useGetAllCorporatePaymentsService } = corporateQueries()
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      limit: query.limit || 10,
    }
    if (query.after) params.after = query.after
    if (query.status) params.status = query.status
    if ((query as any).type) params.type = (query as any).type
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: paymentsResponse, isLoading } = useGetAllCorporatePaymentsService(queryParams)
  const allCorporatePayments = paymentsResponse?.data || []
  const pagination = paymentsResponse?.pagination

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
        ? allCorporatePayments.length + (Number(query.limit) || 10)
        : allCorporatePayments.length,
    [pagination?.hasNextPage, allCorporatePayments.length, query.limit],
  )

  const purchaseTabConfig = [
    {
      key: 'past' as const,
      label: 'Past Purchases',
      component: PastPurchase,
    },
  ]

  function getPurchaseOptions(
    purchase: any,
    option: {
      hasView?: boolean
      hasUpdate?: boolean
      hasDelete?: boolean
    },
  ) {
    if (!purchase) return []
    const baseOptions = []

    const viewOption = [
      {
        label: 'View',
        onClickFn: () => purchaseModal.openModal(MODALS.PURCHASE.CHILDREN.VIEW, purchase),
      },
    ]

    const editOption = {
      label: 'Edit',
      onClickFn: () => {
        // TODO: Implement edit purchase functionality
        console.log('Edit purchase:', purchase)
      },
    }

    const deleteOption = {
      label: 'Delete',
      onClickFn: () => {
        // TODO: Implement delete purchase functionality
        console.log('Delete purchase:', purchase)
      },
    }

    if (option?.hasView) {
      baseOptions.push(...viewOption)
    }

    if (option?.hasUpdate) {
      baseOptions.push(editOption)
    }

    if (option?.hasDelete) {
      baseOptions.push(deleteOption)
    }

    return baseOptions
  }

  return {
    purchaseModal,
    query,
    setQuery,
    purchaseTabConfig,
    getPurchaseOptions,
    user,
    currentTab,
    handleBulkPurchase,
    allCorporatePayments,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  }
}
