import { useMemo, useCallback } from 'react'
import { PaginatedTable, Text } from '@/components'
import { redemptionListColumns, redemptionListCsvHeaders } from '../../../components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { OPTIONS } from '@/utils/constants/filter'
import { useRedemptionQueries } from '@/features/dashboard/hooks'
import { branchQueries } from '@/features/dashboard/branch/hooks'

export default function Redemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const params = useMemo(() => {
    const apiParams: Record<string, unknown> = {
      limit: query.limit || 10,
    }
    if (query.after) apiParams.after = query.after
    if ((query as any).card_type) apiParams.card_type = (query as any).card_type
    if ((query as any).phone_number) apiParams.phone_number = (query as any).phone_number
    if (query.dateFrom) apiParams.dateFrom = query.dateFrom
    if (query.dateTo) apiParams.dateTo = query.dateTo
    if ((query as any).status) apiParams.status = (query as any).status
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

  const redemptionsData = useMemo(() => {
    if (!redemptionsResponse) return []
    return Array.isArray(redemptionsResponse?.data) ? redemptionsResponse.data : []
  }, [redemptionsResponse])

  const pagination = redemptionsResponse?.pagination

  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  const estimatedTotal = useMemo(() => {
    return pagination?.hasNextPage
      ? redemptionsData.length + (Number(query.limit) || 10)
      : redemptionsData.length
  }, [pagination, redemptionsData.length, query.limit])

  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Redemptions
          </Text>
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={redemptionListColumns}
            data={redemptionsData}
            total={estimatedTotal}
            loading={isLoading}
            query={query}
            setQuery={setQuery}
            searchPlaceholder="Search by card type or amount..."
            csvHeaders={redemptionListCsvHeaders}
            printTitle="Redemptions"
            noSearch
            noExport
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              simpleSelects: [
                { label: 'card_type', options: OPTIONS.CARD_TYPE },
                { label: 'status', options: OPTIONS.TRANSACTION_STATUS },
              ],
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
