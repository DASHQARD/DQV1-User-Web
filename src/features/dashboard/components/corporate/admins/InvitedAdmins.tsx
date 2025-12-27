import { PaginatedTable, Text } from '@/components'
import { useCorporateAdmins } from '@/features/dashboard/hooks'
import { MODALS } from '@/utils/constants'
import { invitedAdminsListColumns, invitedAdminsListCsvHeaders } from '../tableConfigs'
import { ViewAdminDetails } from '../modals'
import { DeleteAdminInvitiationAction } from '../modals/DeleteAdminInvitiationAction'

export default function InvitedAdmins() {
  const {
    query,
    invitedCorporateAdminsList,
    modal,
    isLoadingInvitedCorporateAdminsList,
    setQuery,
  } = useCorporateAdmins()
  return (
    <>
      <div className="relative space-y-[37px]">
        <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
          <Text variant="h6" weight="medium">
            Invited admins
          </Text>
        </div>
        <PaginatedTable
          filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
          columns={invitedAdminsListColumns}
          data={invitedCorporateAdminsList}
          total={invitedCorporateAdminsList?.length}
          loading={isLoadingInvitedCorporateAdminsList}
          query={query}
          setQuery={setQuery}
          csvHeaders={invitedAdminsListCsvHeaders}
          printTitle="Admins"
        />
      </div>

      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.VIEW && <ViewAdminDetails />}
      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.DELETE_INVITATION && (
        <DeleteAdminInvitiationAction />
      )}
    </>
  )
}
