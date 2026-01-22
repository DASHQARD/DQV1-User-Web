import { useMemo, useCallback } from 'react'
import { PaginatedTable } from '@/components'
import { useCorporateAdmins } from '@/features/dashboard/hooks'
import { MODALS } from '@/utils/constants'
import { invitedAdminsListColumns, invitedAdminsListCsvHeaders } from '../tableConfigs'
import { ViewAdminDetails } from '../modals'
import { DeleteAdminInvitiationAction } from '../modals/DeleteAdminInvitiationAction'
import { OPTIONS } from '@/utils/constants/filter'

export default function InvitedAdmins() {
  const {
    invitedQuery,
    setInvitedQuery,
    invitedCorporateAdminsList,
    invitedPagination,
    modal,
    isLoadingInvitedCorporateAdminsList,
  } = useCorporateAdmins()

  const handleNextPage = useCallback(() => {
    if (invitedPagination?.hasNextPage && invitedPagination?.next) {
      setInvitedQuery({ ...invitedQuery, after: invitedPagination.next })
    }
  }, [invitedPagination, invitedQuery, setInvitedQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setInvitedQuery({ ...invitedQuery, after })
    },
    [invitedQuery, setInvitedQuery],
  )

  const estimatedTotal = useMemo(() => {
    return invitedPagination?.hasNextPage
      ? invitedCorporateAdminsList.length + (invitedQuery.limit || 10)
      : invitedCorporateAdminsList.length
  }, [invitedPagination, invitedCorporateAdminsList.length, invitedQuery.limit])

  return (
    <>
      <div className="relative pt-14">
        <PaginatedTable
          filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
          columns={invitedAdminsListColumns}
          data={invitedCorporateAdminsList}
          total={estimatedTotal}
          loading={isLoadingInvitedCorporateAdminsList}
          query={invitedQuery}
          setQuery={setInvitedQuery}
          csvHeaders={invitedAdminsListCsvHeaders}
          printTitle="Invited Admins"
          onNextPage={handleNextPage}
          hasNextPage={invitedPagination?.hasNextPage}
          hasPreviousPage={invitedPagination?.hasPreviousPage}
          currentAfter={invitedQuery.after}
          previousCursor={invitedPagination?.previous}
          onSetAfter={handleSetAfter}
          filterBy={{
            simpleSelects: [
              { label: 'status', options: OPTIONS.CORPORATE_ADMIN_INVITATION_STATUS },
            ],
            // date: [{ queryKey: 'dateFrom', label: 'Date range' }],
          }}
        />
      </div>

      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.VIEW && <ViewAdminDetails />}
      {modal.modalState === MODALS.CORPORATE_ADMIN.CHILDREN.DELETE_INVITATION && (
        <DeleteAdminInvitiationAction />
      )}
    </>
  )
}
