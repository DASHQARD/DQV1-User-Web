import { Text, Button } from '@/components'
import { PaginatedTable } from '@/components/Table'
import {
  CreateCorporateRecipient,
  ViewRecipientDetails,
} from '@/features/dashboard/components/corporate/modals'
import { recipientsColumns, recipientsCsvHeaders } from '@/features/dashboard/components'
import { useCorporateRecipients } from '@/features/dashboard/hooks'
import { Icon } from '@/libs'

export default function Recipients() {
  const {
    query,
    setQuery,
    handleOpenCreateModal,
    recipientsData,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
    clearUnassigned,
    isClearingUnassigned,
  } = useCorporateRecipients()

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Recipients
            </Text>
            <div className="flex items-center gap-2">
              {(estimatedTotal ?? 0) > 0 && (
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => clearUnassigned()}
                  disabled={isClearingUnassigned}
                >
                  <Icon icon="bi:trash" className="w-4 h-4" />
                  {isClearingUnassigned ? 'Clearing...' : 'Clear All Recipients'}
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={handleOpenCreateModal}
              >
                <Icon icon="bi:person-plus-fill" className="w-4 h-4" />
                Add Recipient
              </Button>
            </div>
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
