import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  ApproveAction,
  RejectAction,
  RequestDetails,
  requestListCsvHeaders,
  requestsListColumns,
} from '@/features/dashboard/components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { vendorQueries } from '../../hooks'

export default function Requests() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetRequestsVendorService } = vendorQueries()
  const { data: requestsVendorList, isLoading: isLoadingRequestsVendorList } =
    useGetRequestsVendorService()

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
                simpleSelects: [{ label: 'status', options: OPTIONS.REQUEST_STATUS }],
              }}
              noSearch
              printTitle="Requests"
            />
          </div>
        </div>
      </div>

      <RequestDetails />
      <ApproveAction />
      <RejectAction />
    </>
  )
}
