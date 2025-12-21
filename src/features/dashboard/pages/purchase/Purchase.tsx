import { PaginatedTable, Text } from '@/components'
import { BulkUploadGiftCards } from '../../components/corporate/modals/BulkUploadGiftCards'
import { purchasesListColumns, purchaseListCsvHeaders } from '../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread } from '@/hooks'
import type { QueryType } from '@/types/shared'

export default function Purchase() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              My Purhaces
            </Text>
            <div className="flex items-center gap-3">
              <BulkUploadGiftCards />
            </div>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                My Purhaces (0)
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={purchasesListColumns}
              data={[]}
              loading={false}
              total={0}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by product name or type..."
              csvHeaders={purchaseListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.PURCHASE_STATUS }],
              }}
              printTitle="Purchases"
            />
          </div>
        </div>
      </div>
    </>
  )
}
