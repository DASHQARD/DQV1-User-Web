import { PaginatedTable, Text } from '@/components'
import { adminsListColumns, adminsListCsvHeaders } from '../tableConfigs'
import { useCorporateAdmins } from '@/features/dashboard/hooks'
import { MODALS } from '@/utils/constants'
import { ViewAdminDetails } from '../modals'

export default function AllAdmins() {
  const { query, corporateAdminsList, modal, isLoadingCorporateAdminsList, setQuery } =
    useCorporateAdmins()
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
          total={corporateAdminsList?.length}
          loading={isLoadingCorporateAdminsList}
          query={query}
          setQuery={setQuery}
          csvHeaders={adminsListCsvHeaders}
          printTitle="Admins"
        />
      </div>

      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.VIEW && <ViewAdminDetails />}
    </>
  )
}
