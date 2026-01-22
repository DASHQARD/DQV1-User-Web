import { useMemo, useCallback } from 'react'
import { Text, Button } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { Icon } from '@/libs'
import { corporateQueries } from '../../hooks'
import {
  CreateCorporateRecipient,
  ViewRecipientDetails,
} from '@/features/dashboard/components/corporate/modals'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { recipientsColumns, recipientsCsvHeaders } from '@/features/dashboard/components'

export default function Recipients() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT,
  })
  const { useGetAllRecipientsService } = corporateQueries()

  const params = useMemo(() => {
    const apiParams: any = {
      limit: query.limit || 10,
    }
    if (query.after) {
      apiParams.after = query.after
    }
    if (query.search) {
      apiParams.search = query.search
    }
    return apiParams
  }, [query])

  const { data: recipientsResponse, isLoading } = useGetAllRecipientsService(params)

  // Extract data and pagination from response
  const recipientsData = recipientsResponse?.data || []
  const pagination = recipientsResponse?.pagination

  // Handle cursor-based pagination
  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination?.hasNextPage, pagination?.next, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  // Calculate estimated total for display
  const estimatedTotal = pagination?.hasNextPage
    ? recipientsData.length + (query.limit || 10)
    : recipientsData.length

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Recipients
            </Text>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => modal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_RECIPIENT)}
            >
              <Icon icon="bi:person-plus-fill" className="w-4 h-4" />
              Add Recipient
            </Button>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All recipients
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={recipientsColumns}
              data={recipientsData}
              total={estimatedTotal}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              csvHeaders={recipientsCsvHeaders}
              printTitle="Recipients"
              onNextPage={handleNextPage}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              currentAfter={query.after}
              previousCursor={pagination?.previous}
              onSetAfter={handleSetAfter}
              noSearch
            />
          </div>
        </div>
      </div>
      <CreateCorporateRecipient />
      <ViewRecipientDetails />
    </>
  )
}
