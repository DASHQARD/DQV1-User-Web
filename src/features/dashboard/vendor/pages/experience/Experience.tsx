import { useMemo, useCallback } from 'react'
import { Text, PaginatedTable } from '@/components'
import { useReducerSpread, useUserProfile } from '@/hooks'
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
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { vendorQueries } from '../../hooks'
import { branchQueries } from '@/features/dashboard/branch'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

export default function Experience() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const params = useMemo(() => {
    const apiParams: Record<string, unknown> = {
      limit: query.limit || 10,
    }
    if (query.after) apiParams.after = query.after
    if (query.search) apiParams.search = query.search
    if ((query as any).status) apiParams.status = (query as any).status
    if ((query as any).card_type) apiParams.card_type = (query as any).card_type
    if (query.dateFrom) apiParams.dateFrom = query.dateFrom
    if (query.dateTo) apiParams.dateTo = query.dateTo
    return apiParams
  }, [query])

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = (userProfileData as any)?.user_type
  const isCorporate = userType === 'corporate' || userType === 'corporate super admin'

  const { useGetCardsByVendorIdService } = vendorQueries()
  const { data: cardsResponse, isLoading } = useGetCardsByVendorIdService(params)

  const { useGetBranchExperiencesService } = branchQueries()
  const { data: branchCardsResponse, isLoading: isLoadingBranchCards } =
    useGetBranchExperiencesService(params)

  const { useGetCorporateCardsService } = corporateQueries()
  const { data: corporateCardsResponse, isLoading: isLoadingCorporateCards } =
    useGetCorporateCardsService(params)

  const response = isCorporate ? corporateCardsResponse : cardsResponse || branchCardsResponse
  const isLoadingAny = isCorporate ? isLoadingCorporateCards : isLoading || isLoadingBranchCards

  const experiencesData = useMemo(() => {
    if (!response) return []
    return Array.isArray(response?.data) ? response.data : []
  }, [response])

  const pagination = response?.pagination

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
      ? experiencesData.length + (Number(query.limit) || 10)
      : experiencesData.length
  }, [pagination, experiencesData.length, query.limit])

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
          <div className="relative pt-14">
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={experienceListColumns}
              data={experiencesData}
              total={estimatedTotal}
              loading={isLoadingAny}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by product name or type..."
              csvHeaders={experienceListCsvHeaders}
              printTitle="Experiences"
              onNextPage={handleNextPage}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              currentAfter={query.after}
              previousCursor={pagination?.previous}
              onSetAfter={handleSetAfter}
              filterBy={{
                simpleSelects: [
                  { label: 'status', options: OPTIONS.EXPERIENCE_STATUS },
                  {
                    label: 'card_type',
                    options: OPTIONS.BRANCH_AND_CORPORATE_EXPERIENCE_CARD_TYPE,
                  },
                ],
                date: [{ queryKey: 'dateFrom', label: 'Date range' }],
              }}
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
