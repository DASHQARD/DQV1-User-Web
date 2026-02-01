import { PaginatedTable } from '@/components'
import { adminsListColumns, adminsListCsvHeaders } from '../tableConfigs'
import { useCorporateAdmins } from '@/features/dashboard/hooks'
import { MODALS } from '@/utils/constants'
import { ViewAdminDetails } from '../modals'
import { OPTIONS } from '@/utils/constants/filter'

export default function AllAdmins() {
  const {
    query,
    corporateAdminsList,
    pagination,
    modal,
    isLoadingCorporateAdminsList,
    setQuery,
    allAdminsHandleNextPage,
    allAdminsHandleSetAfter,
    allAdminsEstimatedTotal,
  } = useCorporateAdmins()

  return (
    <>
      <div className="relative pt-14">
        <PaginatedTable
          filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
          columns={adminsListColumns}
          data={corporateAdminsList}
          total={allAdminsEstimatedTotal}
          loading={isLoadingCorporateAdminsList}
          query={query}
          setQuery={setQuery}
          csvHeaders={adminsListCsvHeaders}
          printTitle="All Admins"
          onNextPage={allAdminsHandleNextPage}
          hasNextPage={pagination?.hasNextPage}
          hasPreviousPage={pagination?.hasPreviousPage}
          currentAfter={query.after}
          previousCursor={pagination?.previous}
          onSetAfter={allAdminsHandleSetAfter}
          filterBy={{
            simpleSelects: [{ label: 'status', options: OPTIONS.CORPORATE_ADMIN_STATUS }],
            // date: [{ queryKey: 'dateFrom', label: 'Date range' }],
          }}
        />
      </div>

      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.VIEW && <ViewAdminDetails />}
    </>
  )
}
