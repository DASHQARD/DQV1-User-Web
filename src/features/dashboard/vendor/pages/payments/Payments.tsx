import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PaginatedTable, Text } from '@/components'
import { vendorQueries } from '@/features'
import { vendorMutations } from '@/features/dashboard/vendor/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import {
  vendorPaymentListColumns,
  vendorPaymentListCsvHeaders,
} from '@/features/dashboard/components/vendors/tableConfigs/VendorPaymentList'
import {
  BranchDetailsModal,
  DeleteBranchPaymentDetailsModal,
} from '@/features/dashboard/components/vendors/modals'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread, useUserProfile } from '@/hooks'

export default function Payments() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)
  const { useGetVendorPaymentsService, useBranchesService } = vendorQueries()
  const { useGetPaymentDetailsService } = corporateQueries()
  const { useCreateVendorPaymentService } = vendorMutations()
  const { useGetUserProfileService } = useUserProfile()

  const { data: userProfileData } = useGetUserProfileService()
  const { data: branchesData } = useBranchesService()
  const { mutate: createVendorPayment, isPending: isCreatingVendorPayment } =
    useCreateVendorPaymentService()

  const hasTriedAutoCreateRef = useRef(false)
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const { data: vendorPaymentsResponse, isLoading: isLoadingVendorPayments } =
    useGetVendorPaymentsService(isCorporateSuperAdmin ? undefined : query)
  const { data: corporatePaymentDetailsResponse, isLoading: isLoadingCorporatePaymentDetails } =
    useGetPaymentDetailsService()

  const corporatePaymentDetails =
    corporatePaymentDetailsResponse?.data || corporatePaymentDetailsResponse || {}
  const corporateBankAccounts = corporatePaymentDetails?.bank_accounts || []
  const corporateMomoAccounts = corporatePaymentDetails?.mobile_money_accounts || []
  const corporatePayments = [...corporateBankAccounts, ...corporateMomoAccounts].map(
    (account: any, index: number) => ({
      id: String(account.id || `payment-detail-${index}`),
      vendor_name: account.account_holder_name || 'Corporate Super Admin',
      payment_frequency: undefined,
      branch_location: account.branch || account.bank_branch || '',
      amount: 0,
      payment_period: corporatePaymentDetails?.default_payment_option || 'payment_details',
      status: 'pending',
      due_date: '',
      paid_date: '',
      invoice_number: '',
      description:
        account.payment_method === 'bank'
          ? `Bank: ${account.bank_name || ''}`
          : `Mobile Money: ${account.provider || ''}`,
      branch_id: account.branch_id,
      vendor_id: account.user_id,
    }),
  )

  const payments = isCorporateSuperAdmin ? corporatePayments : vendorPaymentsResponse?.data || []
  const paymentsResponse = isCorporateSuperAdmin
    ? { data: corporatePayments, pagination: { limit: corporatePayments.length } }
    : vendorPaymentsResponse
  const total = paymentsResponse?.pagination?.limit ? payments.length : payments.length
  const branchesArray = useMemo(() => {
    if (!branchesData) return []
    return Array.isArray(branchesData) ? branchesData : branchesData?.data || []
  }, [branchesData])

  useEffect(() => {
    if (isCorporateSuperAdmin) return
    if (hasTriedAutoCreateRef.current || isLoadingVendorPayments || isCreatingVendorPayment) return
    if (!vendorPaymentsResponse) return
    if (payments.length > 0) {
      hasTriedAutoCreateRef.current = true
      return
    }

    const vendorId = userProfileData?.vendor_id
    const vendorUserId = userProfileData?.id
    const firstBranch = branchesArray[0]
    const branchId = firstBranch?.id || firstBranch?.branch_id
    const branchLocation = firstBranch?.branch_location || 'N/A'

    if (!vendorId || !vendorUserId || !branchId) return

    const now = new Date()
    const paymentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    hasTriedAutoCreateRef.current = true
    createVendorPayment({
      vendor_id: vendorId,
      vendor_user_id: vendorUserId,
      payment_frequency: 'daily',
      branch_location: branchLocation,
      branch_id: branchId,
      payment_amount: 0.01,
      payment_period: paymentPeriod,
      due_date: now.toISOString(),
      description: 'Auto-created vendor payment record',
    })
  }, [
    vendorPaymentsResponse,
    payments.length,
    isLoadingVendorPayments,
    isCreatingVendorPayment,
    userProfileData?.vendor_id,
    userProfileData?.id,
    branchesArray,
    createVendorPayment,
    isCorporateSuperAdmin,
    vendorIdFromUrl,
  ])

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
              loading={
                (isCorporateSuperAdmin
                  ? isLoadingCorporatePaymentDetails
                  : isLoadingVendorPayments || isCreatingVendorPayment) as boolean
              }
              query={query}
              setQuery={setQuery}
              searchPlaceholder="Search by vendor name, business name, or payment period..."
              csvHeaders={vendorPaymentListCsvHeaders}
              printTitle="Vendor Payments"
            />
          </div>
        </div>
      </div>

      <BranchDetailsModal />
      <DeleteBranchPaymentDetailsModal />
    </>
  )
}
