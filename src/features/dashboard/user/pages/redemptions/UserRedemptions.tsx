import { useMemo, useCallback } from 'react'
import { PaginatedTable, Text } from '@/components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { OPTIONS } from '@/utils/constants/filter'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { userRedemptionsColumns, userRedemptionsCsvHeaders } from '@/features/dashboard/components'

export default function UserRedemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  // Build params for the API call
  const params = useMemo(() => {
    const apiParams: Record<string, any> = {
      limit: query.limit || 10,
    }

    if (query.after) {
      apiParams.after = query.after
    }

    if (query.card_type) {
      apiParams.card_type = query.card_type
    }

    if (query.status) {
      apiParams.status = query.status
    }

    if (query.dateFrom) {
      apiParams.dateFrom = query.dateFrom
    }

    if (query.dateTo) {
      apiParams.dateTo = query.dateTo
    }

    return apiParams
  }, [query])

  const { useGetUserRedemptionsService } = useRedemptionQueries()
  const { data: userRedemptionsResponse, isLoading: isLoadingUserRedemptions } =
    useGetUserRedemptionsService(params)

  const redemptions = userRedemptionsResponse?.data || []
  const pagination = userRedemptionsResponse?.pagination

  // Handle cursor-based pagination
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

  // Calculate estimated total for display
  const estimatedTotal = pagination?.hasNextPage
    ? redemptions.length + (query.limit || 10)
    : redemptions.length

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Redemptions
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                Redemptions ({redemptions.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={userRedemptionsColumns}
              data={redemptions}
              total={estimatedTotal}
              loading={isLoadingUserRedemptions}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by card type, amount, or phone number..."
              csvHeaders={userRedemptionsCsvHeaders}
              printTitle="Redemptions"
              noSearch
              filterBy={{
                simpleSelects: [
                  { label: 'card_type', options: OPTIONS.CARD_TYPE },
                  { label: 'status', options: OPTIONS.TRANSACTION_STATUS },
                ],
                date: [{ queryKey: 'dateFrom', label: 'Date range' }],
              }}
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
    </>
  )
}
