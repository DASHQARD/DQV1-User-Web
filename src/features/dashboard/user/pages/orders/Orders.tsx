import { useCallback, useMemo } from 'react'
import { PaginatedTable, Text } from '@/components'
import type { QueryType } from '@/types'
import { DEFAULT_QUERY } from '@/utils/constants'
import { useReducerSpread } from '@/hooks'
import { usePaymentInfoService } from '@/features/dashboard/hooks'
import { PaymentDetails, paymentListColumns } from '@/features/dashboard/components'
import { paymentListCsvHeaders } from '@/features/dashboard/components/payment/tableConfigs/payment'
import { OPTIONS } from '@/utils/constants/filter'
import { appendDateRangeApiParams } from '@/utils/helpers'

export default function Orders() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const params = useMemo(() => {
    const apiParams: Record<string, string | number> = {
      limit: query.limit || 10,
    }

    if (query.after) {
      apiParams.after = query.after
    }

    if (query.status) {
      apiParams.status = query.status
    }

    appendDateRangeApiParams(apiParams, query)

    if (query.search) {
      apiParams.search = query.search
    }

    return apiParams
  }, [query])

  const { useGetPaymentByIdService } = usePaymentInfoService()
  const { data: paymentResponse, isLoading } = useGetPaymentByIdService(params)

  const response = paymentResponse as any
  const paymentsArray = Array.isArray(response)
    ? response
    : response?.data || (response ? [response] : [])

  const payments = paymentsArray || []
  const pagination = response?.pagination

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

  const estimatedTotal = pagination?.hasNextPage
    ? payments.length + (query.limit || 10)
    : payments.length

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="mb-4 md:mb-6">
        <Text variant="h2" weight="semibold" className="text-primary-900 text-xl md:text-2xl">
          Orders
        </Text>
        <Text variant="p" className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">
          View and manage your card purchase orders
        </Text>
      </div>

      <PaginatedTable
        columns={paymentListColumns}
        data={payments}
        loading={isLoading}
        total={estimatedTotal}
        query={query}
        setQuery={setQuery}
        searchPlaceholder="Search by receipt"
        printTitle="Orders"
        csvHeaders={paymentListCsvHeaders}
        filterBy={{
          simpleSelects: [{ label: 'status', options: OPTIONS.PAYMENT_STATUS }],
          date: [{ queryKey: 'dateFrom', label: 'Date range' }],
        }}
        onNextPage={handleNextPage}
        hasNextPage={pagination?.hasNextPage}
        hasPreviousPage={pagination?.hasPreviousPage}
        currentAfter={query.after}
        previousCursor={pagination?.previous}
        onSetAfter={handleSetAfter}
      />

      <PaymentDetails />
    </div>
  )
}
