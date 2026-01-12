import React from 'react'
import { PaginatedTable, Text } from '@/components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { userRedemptionsColumns, userRedemptionsCsvHeaders } from '../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { useRedemptionQueries } from '../../hooks'

export default function UserRedemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  // Build params for the API call
  const params = React.useMemo(() => {
    const apiParams: any = {
      limit: query.limit || 10,
    }

    if (query.after) {
      apiParams.after = query.after
    }

    // Map card_type filter
    if (query.card_type) {
      apiParams.card_type = query.card_type
    }

    // Map other filters
    if (query.phone_number) {
      apiParams.phone_number = query.phone_number
    }

    if (query.vendor_id) {
      apiParams.vendor_id = Number(query.vendor_id)
    }

    if (query.dateFrom) {
      apiParams.dateFrom = query.dateFrom
    }

    if (query.dateTo) {
      apiParams.dateTo = query.dateTo
    }

    if (query.status) {
      apiParams.status = query.status
    }

    if (query.location) {
      apiParams.location = query.location
    }

    if (query.branch) {
      apiParams.branch = query.branch
    }

    return apiParams
  }, [query])

  const { useGetUserRedemptionsService } = useRedemptionQueries()
  const { data: userRedemptionsResponse, isLoading: isLoadingUserRedemptions } =
    useGetUserRedemptionsService(params)

  const redemptions = userRedemptionsResponse?.data || []
  const pagination = userRedemptionsResponse?.pagination

  const total =
    redemptions.length > 0 && pagination?.hasNextPage
      ? redemptions.length + (pagination?.limit || 10)
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
              total={total}
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
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
