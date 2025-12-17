import { PaginatedTable, Text } from '@/components'
// import { useBranches } from '../../hooks/useBranches'

import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread } from '@/hooks'

type QueryType = typeof DEFAULT_QUERY
import { MOCK_BRANCHES } from '@/mocks'
import { BulkUploadBranches } from '@/features/dashboard/components'
import { CreateBranch } from '@/features/dashboard/pages'
import {
  branchListColumns,
  branchListCsvHeaders,
} from '@/features/dashboard/components/corporate/tableConfigs'

export default function BranchManagement() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  // const { data: branchesResponse, isLoading } = useBranches()

  // const branches = branchesResponse?.data || []
  // const total = branchesResponse?.pagination?.limit ? branches.length : branches.length

  // if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-full">
  //       <Loader />
  //     </div>
  //   )
  // }

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Branches management
            </Text>
            <div className="flex items-center gap-3">
              <BulkUploadBranches />
              <CreateBranch />
            </div>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                Branches management
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={branchListColumns}
              data={MOCK_BRANCHES}
              total={MOCK_BRANCHES.length}
              loading={false}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by branch name or location..."
              csvHeaders={branchListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.CUSTOMER_STATUS }],
              }}
              printTitle="Branches"
            />
          </div>
        </div>
      </div>
    </>
  )
}
