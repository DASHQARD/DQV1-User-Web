import { Text, PaginatedTable } from '@/components'
import { useReducerSpread, useUserProfile } from '@/hooks'
import {
  CreateExperience,
  experienceListColumns,
  experienceListCsvHeaders,
} from '../../../components'
import { OPTIONS } from '@/utils/constants/filter'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import type { QueryType } from '@/types/shared'
import { useCards } from '@/features/website'

export default function Experience() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const cardsService = useCards()
  const cardsQuery = cardsService.useCardsService(query)
  const cardsResponse = cardsQuery.data
  const isLoading = cardsQuery.isLoading

  console.log('cardsResponse', cardsResponse)

  const { data: userProfile } = useUserProfile()

  console.log('userProfile', userProfile)

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              My Experiences
            </Text>
            <div className="flex items-center gap-3">
              <CreateExperience />
            </div>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                My Experiences ({cardsResponse?.data?.length || 0})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={experienceListColumns}
              data={cardsResponse?.data || []}
              loading={isLoading}
              total={cardsResponse?.data?.length || 0}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by product name or type..."
              csvHeaders={experienceListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.CUSTOMER_STATUS }],
              }}
              printTitle="Experiences"
            />
          </div>
        </div>
      </div>
    </>
  )
}
