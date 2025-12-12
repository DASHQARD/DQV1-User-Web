import { Loader, PaginatedTable, Text } from '@/components'
import { useBranches } from '../../hooks/useBranches'
import { branchListColumns, CreateBranch, branchListCsvHeaders } from '../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'

export default function BranchManagement() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { data: branchesResponse, isLoading } = useBranches()

  const branches = branchesResponse?.data || []
  const total = branchesResponse?.pagination?.limit ? branches.length : branches.length

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Branches management
            </Text>
            <CreateBranch />
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                Branches management ({branches.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={branchListColumns}
              data={branches}
              total={total}
              loading={isLoading}
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
