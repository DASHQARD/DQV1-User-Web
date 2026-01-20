import React from 'react'
import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { requestListCsvHeaders, requestsListColumns } from '@/features/dashboard/components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { vendorQueries } from '../../hooks'
import {
  VendorRequestDetails,
  VendorApproveAction,
  VendorRejectAction,
} from '@/features/dashboard/components/vendors/modals'

export default function Requests() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetRequestsVendorService } = vendorQueries()

  // Build query parameters for the API
  const queryParams = React.useMemo(() => {
    const params: Record<string, any> = {}
    if (query.search) params.search = query.search
    if (query.status) params.status = query.status
    // Map camelCase to snake_case for backend
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: requestsResponse, isLoading: isLoadingRequestsVendorList } =
    useGetRequestsVendorService(queryParams)

  // Extract data array from response
  const requestsVendorList = React.useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse)
      ? requestsResponse
      : Array.isArray(requestsResponse?.data)
        ? requestsResponse.data
        : []
  }, [requestsResponse])

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Requests
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All requests
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={requestsListColumns}
              data={requestsVendorList}
              total={requestsVendorList?.length || 0}
              loading={isLoadingRequestsVendorList}
              query={query}
              setQuery={setQuery}
              csvHeaders={requestListCsvHeaders}
              filterBy={{
                date: [{ queryKey: 'dateFrom', label: 'Date range' }],
              }}
              searchPlaceholder="Search by name, description, module, or status"
              printTitle="Requests"
            />
          </div>
        </div>
      </div>

      <VendorRequestDetails />
      <VendorApproveAction />
      <VendorRejectAction />
    </>
  )
}
