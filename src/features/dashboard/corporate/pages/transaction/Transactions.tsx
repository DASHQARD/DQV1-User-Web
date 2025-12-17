import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  TransactionDetails,
  transactionListCsvHeaders,
  transactionsListColumns,
} from '@/features/dashboard/components'
import { MOCK_TRANSACTIONS } from '@/mocks'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'

export default function Transactions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8 ">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Transactions
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All transactions
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={transactionsListColumns}
              data={MOCK_TRANSACTIONS}
              total={MOCK_TRANSACTIONS.length}
              loading={false}
              query={query}
              setQuery={setQuery}
              csvHeaders={transactionListCsvHeaders}
              filterBy={{
                simpleSelects: [
                  { label: 'status', options: OPTIONS.TRANSACTION_STATUS },
                  {
                    label: 'direction',
                    options: OPTIONS.TRANSACTION_TYPE,
                  },
                ],
              }}
              noSearch
              printTitle="Transactions"
            />
          </div>
        </div>
      </div>

      <TransactionDetails />
    </>
  )
}
