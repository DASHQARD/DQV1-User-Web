import { Text, PaginatedTable } from '@/components'
import {
  vendorInvitationListColumns,
  vendorInvitationListCsvHeaders,
} from '@/features/dashboard/components'
import { useVendorInvitations } from '@/features/dashboard/hooks'
import { OPTIONS } from '@/utils/constants/filter'

export default function VendorInvitations() {
  const {
    query,
    invitationList,
    pagination,
    isLoading,
    setQuery,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  } = useVendorInvitations()

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Vendor Invitations
          </Text>
        </div>
        <div className="relative pt-14">
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={vendorInvitationListColumns}
            data={invitationList}
            total={estimatedTotal}
            loading={isLoading}
            query={query}
            setQuery={setQuery}
            csvHeaders={vendorInvitationListCsvHeaders}
            searchPlaceholder="Search invitations"
            printTitle="Vendor Invitations"
            onNextPage={handleNextPage}
            hasNextPage={pagination?.hasNextPage}
            hasPreviousPage={pagination?.hasPreviousPage}
            currentAfter={query.after}
            previousCursor={pagination?.previous}
            onSetAfter={handleSetAfter}
            filterBy={{
              simpleSelects: [{ label: 'status', options: OPTIONS.VENDOR_INVITATION_STATUS }],
              date: [{ queryKey: 'dateFrom', label: 'Date range' }],
            }}
          />
        </div>
      </div>
    </div>
  )
}
