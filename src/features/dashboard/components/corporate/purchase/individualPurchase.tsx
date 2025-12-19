import { PaginatedTable } from '@/components/Table'
import { purchaseListCsvHeaders, purchasesListColumns } from '@/features/dashboard/components'
import { MOCK_PURCHASES } from '@/mocks'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import { useReducerSpread } from '@/hooks'

type QueryType = typeof DEFAULT_QUERY

export default function IndividualPurchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <div className="relative space-y-[37px]">
      <PaginatedTable
        filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
        columns={purchasesListColumns}
        data={MOCK_PURCHASES}
        total={MOCK_PURCHASES.length}
        loading={false}
        query={query}
        setQuery={setQuery}
        csvHeaders={purchaseListCsvHeaders}
        filterBy={{
          simpleSelects: [{ label: 'status', options: OPTIONS.TRANSACTION_STATUS }],
        }}
        noSearch
        printTitle="Purchases"
      />
    </div>
  )
}
