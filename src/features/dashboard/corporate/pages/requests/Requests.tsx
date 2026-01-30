import { useMemo, useCallback } from 'react'
import { Text, PaginatedTable } from '@/components'
import {
  ApproveAction,
  RejectAction,
  DeleteRequestModal,
  requestListCsvHeaders,
  requestsListColumns,
  VendorRequestDetails,
} from '@/features/dashboard/components'
import { useCorporateRequests } from '@/features/dashboard/hooks'
import { OPTIONS } from '@/utils/constants/filter'

export default function Requests() {
  const { query, requestCorporatesList, pagination, isLoadingRequestCorporatesList, setQuery } =
    useCorporateRequests()

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
      ? requestCorporatesList.length + (Number(query.limit) || 10)
      : requestCorporatesList.length
  }, [pagination, requestCorporatesList.length, query.limit])

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Requests
            </Text>
          </div>
          <div className="relative pt-14">
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={requestsListColumns}
              data={requestCorporatesList}
              total={estimatedTotal}
              loading={isLoadingRequestCorporatesList}
              query={query}
              setQuery={setQuery}
              csvHeaders={requestListCsvHeaders}
              searchPlaceholder="Search by name, description, module, or status"
              printTitle="Requests"
              onNextPage={handleNextPage}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              currentAfter={query.after}
              previousCursor={pagination?.previous}
              onSetAfter={handleSetAfter}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.REQUEST_STATUS }],
                date: [{ queryKey: 'dateFrom', label: 'Date range' }],
              }}
            />
          </div>
        </div>
      </div>

      <VendorRequestDetails />
      <ApproveAction />
      <RejectAction />
      <DeleteRequestModal />
    </>
  )
}
