import { useMemo } from 'react'
import { PaginatedTable } from '@/components/Table'
import { purchaseListCsvHeaders, purchasesListColumns } from '@/features/dashboard/components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import { useReducerSpread } from '@/hooks'
import { Text } from '@/components'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'

type QueryType = typeof DEFAULT_QUERY

export default function IndividualPurchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAllCorporatePaymentsService } = corporateQueries()

  // Build query parameters for the API
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {}
    if (query.limit) params.limit = query.limit
    if (query.after) params.after = query.after
    if (query.status) params.status = query.status
    if (query.search) params.search = query.search
    // Add other query parameters as needed (type, date_from, date_to, min_amount, max_amount, currency, etc.)
    return params
  }, [query])

  const { data: paymentsResponse, isLoading } = useGetAllCorporatePaymentsService(queryParams)

  // Transform payment data to match table column structure - filter for individual purchases only
  const individualPurchases = useMemo(() => {
    if (!paymentsResponse) {
      return []
    }

    // Handle both direct array response and wrapped response with data property
    const paymentsData = Array.isArray(paymentsResponse)
      ? paymentsResponse
      : paymentsResponse?.data || []

    if (!Array.isArray(paymentsData) || paymentsData.length === 0) {
      return []
    }

    // Filter for individual purchase type payments only (exclude bulk_purchase and checkout)
    return paymentsData
      .filter((payment: any) => {
        const paymentType = payment.type?.toLowerCase()
        // Only include individual purchases
        return paymentType === 'purchase' || paymentType === 'individual_purchase'
      })
      .map((payment: any) => ({
        ...payment,
        // Add date field for DateCell component
        date: payment.created_at || payment.updated_at || '',
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [paymentsResponse])

  return (
    <div className="relative space-y-[37px]">
      <Text variant="h6" weight="medium">
        Individual Purchases ({individualPurchases.length})
      </Text>
      <PaginatedTable
        filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
        columns={purchasesListColumns}
        data={individualPurchases}
        total={individualPurchases.length}
        loading={isLoading}
        query={query}
        setQuery={setQuery}
        csvHeaders={purchaseListCsvHeaders}
        filterBy={{
          simpleSelects: [{ label: 'status', options: OPTIONS.TRANSACTION_STATUS }],
        }}
        noSearch
        printTitle="Individual Purchases"
      />
    </div>
  )
}
