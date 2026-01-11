import { useState } from 'react'
import { PaginatedTable, Text } from '@/components'
import type { QueryType } from '@/types'
import { DEFAULT_QUERY } from '@/utils/constants'
import { usePaymentInfoService } from '../../hooks'
import { PaymentDetails, paymentListColumns } from '../../components'
import { paymentListCsvHeaders } from '../../components/payment/tableConfigs/payment'

export default function Orders() {
  const [query, setQuery] = useState<QueryType>(DEFAULT_QUERY)

  const { useGetPaymentByIdService } = usePaymentInfoService()

  const { data: paymentData, isLoading } = useGetPaymentByIdService()
  console.log('paymentData', paymentData)
  // getPaymentById returns PaymentInfoData (single object), but we need an array for the table
  // If it's an array, use it directly; if it's a single object, wrap it in an array
  const payment = Array.isArray(paymentData) ? paymentData : paymentData ? [paymentData] : []

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
        data={payment}
        loading={isLoading}
        total={payment.length}
        query={query}
        setQuery={setQuery}
        searchPlaceholder="Search orders by order number, card type, or status..."
        printTitle="Orders"
        csvHeaders={paymentListCsvHeaders}
      />

      <PaymentDetails />
    </div>
  )
}
