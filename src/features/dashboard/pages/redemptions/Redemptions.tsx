import { Loader, PaginatedTable, Text } from '@/components'
import { useRedemptions } from '../../hooks/useRedemptions'
import { redemptionListColumns, redemptionListCsvHeaders } from '../../components'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'

export default function Redemptions() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { data: redemptionsResponse, isLoading } = useRedemptions()

  const redemptions = redemptionsResponse?.data || []
  const total = redemptionsResponse?.pagination?.limit ? redemptions.length : redemptions.length

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
            />
          </div>
        </div>
      </div>
    </>
  )
}
