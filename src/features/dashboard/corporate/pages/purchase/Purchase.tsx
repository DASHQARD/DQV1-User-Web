import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Button, Text, TabbedView, PaginatedTable } from '@/components'
import {
  PurchaseDetails,
  BulkPurchaseEmployeesModal,
  IndividualPurchaseModal,
  purchasesListColumns,
  purchaseListCsvHeaders,
  SummaryCards,
} from '@/features/dashboard/components'
import { Icon } from '@/libs'
import { usePersistedModalState, useReducerSpread } from '@/hooks'
import { MODALS, DEFAULT_QUERY } from '@/utils/constants'
import { OPTIONS } from '@/utils/constants/filter'
import type { QueryType } from '@/types/shared'
import { usePurchaseManagement } from '@/features/dashboard/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'

export default function Purchase() {
  const { purchaseTabConfig } = usePurchaseManagement()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const currentTab = searchParams.get('tab') || 'bulk'
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetAllCorporatePaymentsService } = corporateQueries()

  const bulkPurchaseModal = usePersistedModalState({
    paramName: MODALS.BULK_EMPLOYEE_PURCHASE.PARAM_NAME,
  })

  const handleBulkPurchase = () => {
    bulkPurchaseModal.openModal(MODALS.BULK_EMPLOYEE_PURCHASE.CHILDREN.CREATE)
  }

  // Build query parameters for the API
  const queryParams = useMemo(() => {
    const params: Record<string, any> = {}
    if (query.limit) params.limit = query.limit
    if (query.after) params.after = query.after
    if (query.status) params.status = query.status
    if (query.search) params.search = query.search
    // Add other query parameters as needed (type, date_from, date_to, min_amount, max_amount, currency, etc.)
    return params
  }, [query])

  const { data: paymentsResponse, isLoading } = useGetAllCorporatePaymentsService(queryParams)

  // Transform payment data to match table column structure
  const purchases = useMemo(() => {
    if (!paymentsResponse) {
      return []
    }

    // Handle both direct array response and wrapped response with data property
    const paymentsData = Array.isArray(paymentsResponse)
      ? paymentsResponse
      : paymentsResponse?.data || []

    if (!Array.isArray(paymentsData) || paymentsData.length === 0) {
      return []
    }

    // Filter for purchase type payments (include purchase, bulk_purchase, and checkout)
    return paymentsData
      .filter((payment: any) => {
        const paymentType = payment.type?.toLowerCase()
        return (
          paymentType === 'purchase' ||
          paymentType === 'bulk_purchase' ||
          paymentType === 'checkout' ||
          paymentType === 'individual_purchase'
        )
      })
      .map((payment: any) => ({
        ...payment,
        // Add date field for DateCell component
        date: payment.created_at || payment.updated_at || '',
      }))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [paymentsResponse])

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

          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                All Purchases ({purchases.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={purchasesListColumns}
              data={purchases}
              loading={isLoading}
              total={purchases.length}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by product name or type..."
              csvHeaders={purchaseListCsvHeaders}
              filterBy={{
                simpleSelects: [{ label: 'status', options: OPTIONS.PURCHASE_STATUS }],
              }}
              printTitle="Purchases"
            />
          </div>
        </div>
      </div>

      <PurchaseDetails />
      <BulkPurchaseEmployeesModal modal={bulkPurchaseModal} />
      <IndividualPurchaseModal />
    </>
  )
}
