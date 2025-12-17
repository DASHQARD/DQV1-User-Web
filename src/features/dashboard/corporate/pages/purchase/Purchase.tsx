import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  PurchaseDetails,
  purchaseListCsvHeaders,
  purchasesListColumns,
  BulkUploadGiftCards,
} from '@/features/dashboard/components'
import { MOCK_PURCHASES } from '@/mocks'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'

export default function Purchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8 ">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Purchases
            </Text>
            <div className="flex items-center gap-3">
              <BulkUploadGiftCards />
            </div>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All purchases
              </Text>
            </div>
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
        </div>
      </div>

      <PurchaseDetails />
    </>
  )
}
