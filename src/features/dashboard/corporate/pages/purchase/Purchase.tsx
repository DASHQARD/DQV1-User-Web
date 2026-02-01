import { Button, Text, TabbedView, PaginatedTable } from '@/components'
import {
  BulkPurchaseEmployeesModal,
  // IndividualPurchaseModal,
  transactionsListColumns,
  TransactionDetails,
  transactionListCsvHeaders,
} from '@/features/dashboard/components'
import { Icon } from '@/libs'
import { usePurchaseManagement } from '@/features/dashboard/hooks'
import { OPTIONS } from '@/utils/constants/filter'

export default function Purchase() {
  const {
    purchaseTabConfig,
    currentTab,
    handleBulkPurchase,
    query,
    setQuery,
    allCorporatePayments,
    pagination,
    isLoading,
    handleNextPage,
    handleSetAfter,
    estimatedTotal,
  } = usePurchaseManagement()

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Purchases
            </Text>
            <div className="flex items-center gap-3">
              {/* <Button
                variant={currentTab === 'individual' ? 'primary' : 'outline'}
                size="medium"
                onClick={handleIndividualPurchase}
                className="flex items-center gap-2"
              >
                <Icon icon="bi:person-fill" className="w-4 h-4" />
                Individual Purchase
              </Button> */}
              <Button
                variant={currentTab === 'bulk' ? 'secondary' : 'outline'}
                size="medium"
                onClick={handleBulkPurchase}
                className="flex items-center gap-2"
              >
                <Icon icon="bi:people-fill" className="w-4 h-4" />
                Bulk Purchase
              </Button>
            </div>
          </div>
          {/* <SummaryCards /> */}

          <TabbedView
            tabs={purchaseTabConfig}
            defaultTab="bulk"
            urlParam="tab"
            containerClassName="space-y-6"
            btnClassName="pb-2"
            tabsClassName="gap-2 border-b border-gray-200"
          />

          <div className="py-10">
            <div className="flex flex-col gap-8 ">
              <div className="relative space-y-[37px]">
                <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
                  <Text variant="h6" weight="medium">
                    All Purchases
                  </Text>
                </div>
                <PaginatedTable
                  filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
                  columns={transactionsListColumns}
                  data={allCorporatePayments}
                  total={estimatedTotal}
                  loading={isLoading}
                  query={query}
                  setQuery={setQuery}
                  csvHeaders={transactionListCsvHeaders}
                  filterBy={{
                    simpleSelects: [
                      {
                        label: 'status',
                        options: OPTIONS.TRANSACTION_TYPE,
                      },
                    ],
                    date: [{ queryKey: 'dateFrom', label: 'Date range' }],
                  }}
                  noSearch
                  printTitle="Purchases"
                  onNextPage={handleNextPage}
                  hasNextPage={pagination?.hasNextPage}
                  hasPreviousPage={pagination?.hasPreviousPage}
                  currentAfter={query.after}
                  previousCursor={pagination?.previous}
                  onSetAfter={handleSetAfter}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionDetails />
      <BulkPurchaseEmployeesModal />
      {/* <IndividualPurchaseModal />  */}
    </>
  )
}
