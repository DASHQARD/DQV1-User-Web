import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import type { PaymentInfoData } from '@/types/user'
import { corporateQueries } from '@/features/dashboard/corporate/hooks'

import { formatCurrency, formatFullDate } from '@/utils/format'

// --- Skeleton Loader ---
function PurchaseDetailsSkeleton() {
  return (
    <div className="h-full px-6 flex flex-col justify-between animate-pulse">
      <div className="grow">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
          >
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
        <div className="h-10 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
// --- End Skeleton Loader ---

export function PurchaseDetails() {
  const modal = usePersistedModalState<PaymentInfoData>({
    paramName: MODALS.PURCHASE.PARAM_NAME,
  })

  // Get payment ID from modal data (could be id, trans_id)
  const paymentIdFromModal = modal.modalData
  const paymentId = paymentIdFromModal?.id?.toString() || paymentIdFromModal?.trans_id || null

  // Fetch payment details by ID
  const { useGetPaymentByIdService } = corporateQueries()
  const { data: paymentDetailsResponse, isLoading } = useGetPaymentByIdService(paymentId)

  // Extract payment data from response
  const paymentData = paymentDetailsResponse
  const isPending = isLoading

  // Console log the response
  console.log('Payment Details Response:', paymentDetailsResponse)

  // Map payment data to display format
  const purchaseInfo = [
    {
      label: 'Status',
      value: (
        <Tag
          variant={getStatusVariant(paymentData?.status || '')}
          value={paymentData?.status || ''}
        />
      ),
    },
    {
      label: 'Transaction ID',
      value: paymentData?.trans_id || paymentData?.id?.toString() || '-',
    },
    {
      label: 'Purchase Type',
      value: paymentData?.type
        ? paymentData.type
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '-',
    },
    {
      label: 'Amount',
      value: formatCurrency(paymentData?.amount || 0),
    },
    {
      label: 'Card Type',
      value: paymentData?.card_type || '-',
    },
    {
      label: 'Recipient Name',
      value: paymentData?.user_name || '-',
    },
    {
      label: 'Recipient Phone',
      value: paymentData?.phone || '-',
    },
    {
      label: 'Receipt Number',
      value: paymentData?.receipt_number || '-',
    },
    {
      label: 'User Type',
      value: paymentData?.user_type
        ? paymentData.user_type
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '-',
    },
    {
      label: 'Created At',
      value: paymentData?.created_at ? formatFullDate(paymentData.created_at) : '-',
    },
    {
      label: 'Updated At',
      value: paymentData?.updated_at ? formatFullDate(paymentData.updated_at) : '-',
    },
  ]

  return (
    <Modal
      title="Purchase Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.PURCHASE.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
    >
      <PrintView>
        {isPending ? (
          <PurchaseDetailsSkeleton />
        ) : (
          <div className="h-full px-6 flex flex-col justify-between">
            <div className="grow">
              {purchaseInfo.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
                >
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-primary-800 capitalize">
                    {item.value || '-'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center gap-3">
              <Button variant="outline" onClick={modal.closeModal} className="w-1/2">
                Cancel
              </Button>
              <Button className="w-1/2" variant="secondary" onClick={globalThis.print}>
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
