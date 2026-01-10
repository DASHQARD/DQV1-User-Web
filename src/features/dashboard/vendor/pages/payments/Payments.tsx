import { Loader, PaginatedTable, Text } from '@/components'
import { vendorQueries } from '@/features'
import {
  vendorPaymentListColumns,
  vendorPaymentListCsvHeaders,
} from '@/features/dashboard/components/vendors/tableConfigs/VendorPaymentList'
import { BranchDetailsModal } from '@/features/dashboard/components/vendors/modals'
import { DEFAULT_QUERY, MODALS } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread, usePersistedModalState } from '@/hooks'
import type { Branch } from '@/utils/schemas'

export default function Payments() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetVendorPaymentsService } = vendorQueries()
  const { data: paymentsResponse, isLoading } = useGetVendorPaymentsService(query)

  const branchModal = usePersistedModalState<Branch>({
    paramName: MODALS.BRANCH.VIEW,
  })

  const payments = paymentsResponse?.data || []
  const total = paymentsResponse?.pagination?.limit ? payments.length : payments.length

  // Get branch data from modal data if available
  const branchData = branchModal.modalData

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

  return (
    <>
      <div className="lg:py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Payments
            </Text>
          </div>
          <div className="relative space-y-[37px]">
            <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
              <Text variant="h6" weight="medium">
                Payments ({payments.length})
              </Text>
            </div>
            <PaginatedTable
              filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
              columns={vendorPaymentListColumns}
              data={payments}
              total={total}
              loading={isLoading}
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by vendor name, business name, or payment period..."
              csvHeaders={vendorPaymentListCsvHeaders}
              printTitle="Vendor Payments"
            />
          </div>
        </div>
      </div>

      <BranchDetailsModal branch={branchData || null} />
    </>
  )
}
