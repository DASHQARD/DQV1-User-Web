import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  requestListCsvHeaders,
  requestsListColumns,
} from '@/features/dashboard/components/corporate/tableConfigs'
import { MOCK_REQUESTS } from '@/mocks'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread } from '@/hooks'

type QueryType = typeof DEFAULT_QUERY

export default function Requests() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Requests
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All requests ({MOCK_REQUESTS.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={requestsListColumns}
              data={MOCK_REQUESTS}
              total={MOCK_REQUESTS.length}
              loading={false}
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
    </>
  )
}
