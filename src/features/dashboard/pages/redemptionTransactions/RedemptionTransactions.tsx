import { Loader, PaginatedTable, Text } from '@/components'
import { useRedemptionTransactions } from '../../hooks/useRedemptionTransactions'
import {
  redemptionTransactionListColumns,
  redemptionTransactionListCsvHeaders,
} from '../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'

export default function RedemptionTransactions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { data: transactionsResponse, isLoading } = useRedemptionTransactions()

  const transactions = transactionsResponse?.data || []
  const total = transactionsResponse?.pagination?.limit ? transactions.length : transactions.length

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Redemption Transactions
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                Redemption Transactions ({transactions.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={redemptionTransactionListColumns}
              data={transactions}
              total={total}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by transaction ID, vendor name, or mobile..."
              csvHeaders={redemptionTransactionListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.CUSTOMER_STATUS }],
              }}
              printTitle="Redemption Transactions"
            />
          </div>
        </div>
      </div>
    </>
  )
}
