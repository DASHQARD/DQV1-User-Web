import { useMemo, useCallback } from 'react'
import { Text, PaginatedTable } from '@/components'
import {
  transactionsListColumns,
  TransactionDetails,
  transactionListCsvHeaders,
} from '@/features/dashboard/components'
import { DEFAULT_QUERY } from '@/utils/constants'
import { corporateQueries } from '../../hooks'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { OPTIONS } from '@/utils/constants/filter'

export default function Transactions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAllCorporatePaymentsService } = corporateQueries()

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      limit: query.limit || 10,
    }
    if (query.after) params.after = query.after
    if (query.status) params.status = query.status
    if ((query as Record<string, unknown>).type)
      params.type = (query as Record<string, unknown>).type
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: paymentsResponse, isLoading } = useGetAllCorporatePaymentsService(queryParams)

  const allCorporatePayments = paymentsResponse?.data || []
  const pagination = paymentsResponse?.pagination

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
    ? allCorporatePayments.length + (query.limit || 10)
    : allCorporatePayments.length

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
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
              data={allCorporatePayments}
              total={estimatedTotal}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              csvHeaders={transactionListCsvHeaders}
              filterBy={{
                simpleSelects: [
                  {
                    label: 'status',
                    options: OPTIONS.TRANSACTION_TYPE,
                  },
                ],
                date: [{ queryKey: 'dateFrom', label: 'Date range' }],
              }}
              noSearch
              printTitle="Transactions"
              onNextPage={handleNextPage}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              currentAfter={query.after}
              previousCursor={pagination?.previous}
              onSetAfter={handleSetAfter}
            />
          </div>
        </div>
      </div>

      <TransactionDetails />
    </>
  )
}
