import { PaginatedTable, Text } from '@/components'
import { redemptionListColumns, redemptionListCsvHeaders } from '../../../components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import React from 'react'
import { OPTIONS } from '@/utils/constants/filter'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { useAuthStore } from '@/stores'
import { useUserProfile } from '@/hooks'

export default function Redemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { user } = useAuthStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  const userType = (user as any)?.user_type || userProfileData?.user_type
  const isBranchManager = userType === 'branch'

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

  // Use branch endpoint for branch managers, vendor endpoint for vendors
  const { useGetBranchRedemptionsService, useGetVendorRedemptionsService } = useRedemptionQueries()

  const branchRedemptionsQuery = useGetBranchRedemptionsService(
    isBranchManager ? params : undefined,
  )
  const vendorRedemptionsQuery = useGetVendorRedemptionsService(
    !isBranchManager ? params : undefined,
  )

  // Get the active redemption data based on user type
  const redemptionsResponse = isBranchManager
    ? branchRedemptionsQuery.data
    : vendorRedemptionsQuery.data
  const isLoading = isBranchManager
    ? branchRedemptionsQuery.isLoading
    : vendorRedemptionsQuery.isLoading

  const redemptions = redemptionsResponse?.data || []
  const total = redemptionsResponse?.pagination?.limit ? redemptions.length : redemptions.length

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
              columns={redemptionListColumns}
              data={redemptions}
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
