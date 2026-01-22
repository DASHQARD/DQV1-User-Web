import { useLocation } from 'react-router-dom'
import { Button, Text, TabbedView, PaginatedTable } from '@/components'
import {
  BulkPurchaseEmployeesModal,
  IndividualPurchaseModal,
  transactionsListColumns,
  TransactionDetails,
  transactionListCsvHeaders,
} from '@/features/dashboard/components'
import { Icon } from '@/libs'
import { usePersistedModalState, useReducerSpread } from '@/hooks'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import { usePurchaseManagement } from '@/features/dashboard/hooks'
import { useMemo, useCallback } from 'react'
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
    const params: Record<string, any> = {
      limit: query.limit || 10,
    }
    if (query.after) {
      params.after = query.after
    }
    if (query.status) params.status = query.status
    if ((query as any).type) params.type = (query as any).type
    // Map camelCase to snake_case for backend
    if (query.dateFrom) params.date_from = query.dateFrom
    if (query.dateTo) params.date_to = query.dateTo
    return params
  }, [query])

  const { data: paymentsResponse, isLoading } = useGetAllCorporatePaymentsService(queryParams)

  // Extract data and pagination from response
  const allCorporatePayments = paymentsResponse?.data || []
  const pagination = paymentsResponse?.pagination

  // Handle cursor-based pagination
  const handleNextPage = useCallback(() => {
    if (pagination?.hasNextPage && pagination?.next) {
      setQuery({ ...query, after: pagination.next })
    }
  }, [pagination?.hasNextPage, pagination?.next, query, setQuery])

  const handleSetAfter = useCallback(
    (after: string) => {
      setQuery({ ...query, after })
    },
    [query, setQuery],
  )

  // Calculate estimated total for display
  const estimatedTotal = pagination?.hasNextPage
    ? allCorporatePayments.length + (query.limit || 10)
    : allCorporatePayments.length

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
      <BulkPurchaseEmployeesModal modal={bulkPurchaseModal} />
      <IndividualPurchaseModal />
    </>
  )
}
