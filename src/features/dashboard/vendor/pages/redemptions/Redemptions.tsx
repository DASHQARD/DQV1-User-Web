import { PaginatedTable, Text } from '@/components'
import { redemptionListColumns, redemptionListCsvHeaders } from '../../../components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import React from 'react'
import { OPTIONS } from '@/utils/constants/filter'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { branchQueries } from '@/features/dashboard/branch/hooks'

export default function Redemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

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

    if (query.dateFrom) {
      apiParams.dateFrom = query.dateFrom
    }

    if (query.dateTo) {
      apiParams.dateTo = query.dateTo
    }

    if (query.status) {
      apiParams.status = query.status
    }

    return apiParams
  }, [query])

  const { useGetVendorRedemptionsService } = useRedemptionQueries()
  const { data: vendorRedemptionsResponse, isLoading: isLoadingVendorRedemptions } =
    useGetVendorRedemptionsService(params)

  const { useGetBranchRedemptionsService } = branchQueries()
  const { data: branchRedemptionsResponse, isLoading: isLoadingBranchRedemptions } =
    useGetBranchRedemptionsService()

  const redemptionsResponse = vendorRedemptionsResponse || branchRedemptionsResponse
  const isLoading = isLoadingVendorRedemptions || isLoadingBranchRedemptions

  const total = redemptionsResponse?.pagination?.limit || 0

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
                Redemptions ({redemptionsResponse?.pagination?.limit || 0})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={redemptionListColumns}
              data={redemptionsResponse}
              total={total}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by card type or amount..."
              csvHeaders={redemptionListCsvHeaders}
              printTitle="Redemptions"
              noSearch
              noExport
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
