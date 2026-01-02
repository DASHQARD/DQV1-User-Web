import { Text, PaginatedTable } from '@/components'
import { useReducerSpread } from '@/hooks'
import {
  CreateExperience,
  ViewExperience,
  EditExperience,
  DeleteExperience,
  experienceListColumns,
  experienceListCsvHeaders,
  VendorSummaryCards,
} from '../../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import type { QueryType } from '@/types/shared'
import { vendorQueries } from '../../hooks'

export default function Experience() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const { useGetCardsByVendorIdService } = vendorQueries()
  const { data: cards, isLoading } = useGetCardsByVendorIdService()

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              My Experiences
            </Text>
            <CreateExperience />
          </div>

          <VendorSummaryCards />
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                My Experiences ({cards?.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={experienceListColumns}
              data={cards}
              loading={isLoading}
              total={cards?.length}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by product name or type..."
              csvHeaders={experienceListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.EXPERIENCE_STATUS }],
              }}
              printTitle="Experiences"
            />
          </div>
        </div>
      </div>
      <ViewExperience />
      <EditExperience />
      <DeleteExperience />
    </>
  )
}
