import { useMemo } from 'react'
import { PaginatedTable } from '@/components/Table'
import { purchaseListCsvHeaders, purchasesListColumns } from '@/features/dashboard/components'
import { MOCK_PURCHASES } from '@/mocks'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import { useReducerSpread } from '@/hooks'
import { Text } from '@/components'

type QueryType = typeof DEFAULT_QUERY

export default function PastPurchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  // Filter past purchases - completed purchases older than 7 days, or any purchase older than 30 days
  const pastPurchases = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return MOCK_PURCHASES.filter((purchase) => {
      const purchaseDate = new Date(purchase.date)
      // Include if: (completed and older than 7 days) OR (any status older than 30 days)
      return (
        (purchase.status === 'completed' && purchaseDate < sevenDaysAgo) ||
        purchaseDate < thirtyDaysAgo
      )
    })
  }, [])

  return (
    <div className="relative space-y-[37px]">
      <Text variant="h6" weight="medium">
        Past Purchases ({pastPurchases.length})
      </Text>
      <PaginatedTable
        filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
        columns={purchasesListColumns}
        data={pastPurchases}
        total={pastPurchases.length}
        loading={false}
        query={query}
        setQuery={setQuery}
        csvHeaders={purchaseListCsvHeaders}
        filterBy={{
          simpleSelects: [{ label: 'status', options: OPTIONS.TRANSACTION_STATUS }],
        }}
        noSearch
        printTitle="Past Purchases"
      />
    </div>
  )
}
