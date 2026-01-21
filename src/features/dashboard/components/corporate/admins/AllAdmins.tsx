import { useMemo, useCallback } from 'react'
import { PaginatedTable, Text } from '@/components'
import { adminsListColumns, adminsListCsvHeaders } from '../tableConfigs'
import { useCorporateAdmins } from '@/features/dashboard/hooks'
import { MODALS } from '@/utils/constants'
import { ViewAdminDetails } from '../modals'

export default function AllAdmins() {
  const { query, corporateAdminsList, pagination, modal, isLoadingCorporateAdminsList, setQuery } =
    useCorporateAdmins()

  // Handle cursor-based pagination
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

  // Calculate estimated total for display
  const estimatedTotal = useMemo(() => {
    return pagination?.hasNextPage
      ? corporateAdminsList.length + (query.limit || 10)
      : corporateAdminsList.length
  }, [pagination, corporateAdminsList.length, query.limit])

  return (
    <>
      <div className="relative space-y-[37px]">
        <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
          <Text variant="h6" weight="medium">
            All admins
          </Text>
        </div>
        <PaginatedTable
          filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
          columns={adminsListColumns}
          data={corporateAdminsList}
          total={estimatedTotal}
          loading={isLoadingCorporateAdminsList}
          query={query}
          setQuery={setQuery}
          csvHeaders={adminsListCsvHeaders}
          printTitle="Admins"
          onNextPage={handleNextPage}
          hasNextPage={pagination?.hasNextPage}
          hasPreviousPage={pagination?.hasPreviousPage}
          currentAfter={query.after}
          previousCursor={pagination?.previous}
          onSetAfter={handleSetAfter}
        />
      </div>

      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.VIEW && <ViewAdminDetails />}
    </>
  )
}
