import { Text, PaginatedTable, Button } from '@/components'
import {
  branchManagerInvitationsListCsvHeaders,
  branchManagerInvitationsListColumns,
} from '@/features/dashboard/components/vendors/tableConfigs'
import {
  CancelBranchManagerInvitationModal,
  DeleteBranchManagerInvitationModal,
  InviteBranchManagerModal,
  RemoveBranchManagerModal,
  UpdateBranchManagerInvitationModal,
} from '@/features/dashboard/components/vendors/modals'
import { Icon } from '@/libs'
import { useBranchManagers } from './useBranchManagers'

export default function BranchManagers() {
  const {
    query,
    setQuery,
    isCorporateSuperAdmin,
    invitations,
    isLoadingInvitations,
    pagination,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
    openInviteModal,
  } = useBranchManagers()

  return (
    <div className="py-10">
      <CancelBranchManagerInvitationModal />
      <DeleteBranchManagerInvitationModal />
      <InviteBranchManagerModal />
      <RemoveBranchManagerModal />
      <UpdateBranchManagerInvitationModal />
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Branch Managers
          </Text>
          {isCorporateSuperAdmin && (
            <Button
              variant="secondary"
              onClick={openInviteModal}
              className="flex items-center gap-2"
            >
              <Icon icon="bi:person-plus-fill" className="text-lg" />
              Invite Branch Manager
            </Button>
          )}
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={branchManagerInvitationsListColumns}
            data={invitations}
            total={estimatedTotal}
            loading={isLoadingInvitations}
            query={query}
            setQuery={setQuery}
            searchPlaceholder="Search by email or name..."
            csvHeaders={branchManagerInvitationsListCsvHeaders}
            printTitle="Branch Manager Invitations"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
