import { useLocation } from 'react-router-dom'
import { Button, Text, TabbedView, PaginatedTable } from '@/components'
import {
  BulkPurchaseEmployeesModal,
  IndividualPurchaseModal,
  SummaryCards,
  transactionsListColumns,
  TransactionDetails,
  transactionListCsvHeaders,
} from '@/features/dashboard/components'
import { Icon } from '@/libs'
import { usePersistedModalState, useReducerSpread } from '@/hooks'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { usePurchaseManagement } from '@/features/dashboard/hooks'
import { useMemo } from 'react'
import { corporateQueries } from '../../hooks'
import type { QueryType } from '@/types'
import { OPTIONS } from '@/utils/constants/filter'

export default function Purchase() {
  const { purchaseTabConfig } = usePurchaseManagement()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentTab = searchParams.get('tab') || 'bulk'

  const bulkPurchaseModal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  const handleBulkPurchase = () => {
    bulkPurchaseModal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)
  }

  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAllCorporatePaymentsService } = corporateQueries()

  // Build query parameters for the API
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {}
    if (query.limit) params.limit = query.limit
    if (query.status) params.status = query.status
    if ((query as any).type) params.type = (query as any).type
    // Map camelCase to snake_case for backend
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: allCorporatePayments, isLoading } = useGetAllCorporatePaymentsService(queryParams)

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
          <SummaryCards />

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
              <div className="flex items-center justify-between">
                <Text variant="h2" weight="semibold" className="text-primary-900">
                  Purchases
                </Text>
              </div>
              <div className="relative space-y-[37px]">
                <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
                  <Text variant="h6" weight="medium">
                    All Purchases ({allCorporatePayments?.length})
                  </Text>
                </div>
                <PaginatedTable
                  filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
                  columns={transactionsListColumns}
                  data={allCorporatePayments}
                  total={allCorporatePayments?.length}
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransactionDetails />
      <BulkPurchaseEmployeesModal modal={bulkPurchaseModal} />
      <IndividualPurchaseModal />
    </>
  )
}
