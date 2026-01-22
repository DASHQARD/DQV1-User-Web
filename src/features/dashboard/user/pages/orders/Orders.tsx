import { useCallback } from 'react'
import { PaginatedTable, Text } from '@/components'
import type { QueryType } from '@/types'
import { DEFAULT_QUERY } from '@/utils/constants'
import { useReducerSpread } from '@/hooks'
import { usePaymentInfoService } from '@/features/dashboard/hooks'
import { PaymentDetails, paymentListColumns } from '@/features/dashboard/components'
import { paymentListCsvHeaders } from '@/features/dashboard/components/payment/tableConfigs/payment'
import { OPTIONS } from '@/utils/constants/filter'

export default function Orders() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const { useGetPaymentByIdService } = usePaymentInfoService()
  const { data: paymentResponse, isLoading } = useGetPaymentByIdService()

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
    <div className="w-full">
      <div className="mb-6">
        <Text variant="h2" weight="semibold" className="text-primary-900">
          Orders
        </Text>
        <Text variant="p" className="text-gray-600 mt-2">
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
        searchPlaceholder="Search orders by order number, card type, or status..."
        printTitle="Orders"
        csvHeaders={paymentListCsvHeaders}
        filterBy={{
          simpleSelects: [{ label: 'status', options: OPTIONS.TRANSACTION_STATUS }],
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
