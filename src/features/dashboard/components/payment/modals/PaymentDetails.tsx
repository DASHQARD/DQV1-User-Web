import { Button, Modal, StatusCell, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import type { PaymentInfoData } from '@/types/user'

function formatDateShort(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A'
  const dateObj = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate()
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObj)
  const year = dateObj.getFullYear()

  return `${day} ${month}, ${year}`
}

export function PaymentDetails() {
  const modal = usePersistedModalState<PaymentInfoData>({
    paramName: MODALS.PAYMENT.ROOT,
  })

  const paymentData = modal.modalData

  // Build display details array
  const displayDetails: Array<{
    label: string
    value: string
    isStatus?: boolean
  }> = [
    {
      label: 'Status',
      value: paymentData?.status || 'N/A',
      isStatus: true,
    },
    {
      label: 'Payment type',
      value: paymentData?.type || 'N/A',
    },
    {
      label: 'Receipt Number',
      value: paymentData?.receipt_number || 'N/A',
    },
    {
      label: 'Amount',
      value:
        paymentData?.amount && paymentData?.currency
          ? formatCurrency(paymentData.amount, paymentData.currency)
          : 'N/A',
    },
    {
      label: 'Currency',
      value: paymentData?.currency || 'N/A',
    },
    {
      label: 'Transaction ID',
      value: paymentData?.trans_id || 'N/A',
    },
    {
      label: 'User',
      value: paymentData?.user_name || 'N/A',
    },
    {
      label: 'User Type',
      value: paymentData?.user_type || 'N/A',
    },
    {
      label: 'Created At',
      value: paymentData?.created_at ? formatDateShort(paymentData.created_at) : 'N/A',
    },
    {
      label: 'Updated At',
      value: paymentData?.updated_at ? formatDateShort(paymentData.updated_at) : 'N/A',
    },
  ].filter((detail) => detail.value !== 'N/A' || detail.label === 'Status') // Show status even if N/A

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.PAYMENT.VIEW)}
      setIsOpen={modal.closeModal}
      title="Payment Details"
      position="side"
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex flex-col gap-2 flex-1">
          {displayDetails.map((detail, index) => (
            <div
              key={detail.label}
              className={`py-3 ${index < displayDetails.length - 1 ? 'border-b border-[#F5F5F5]' : ''}`}
            >
              <p className="text-xs text-[#A4A7AE]">{detail.label}</p>
              {detail.isStatus ? (
                <StatusCell
                  getValue={() => detail.value as string}
                  row={{
                    original: {
                      id: paymentData?.id?.toString() || '',
                      status: detail.value as string,
                    },
                  }}
                />
              ) : (
                <Text variant="span" className="text-gray-900 font-medium">
                  {detail.value}
                </Text>
              )}
            </div>
          ))}
        </div>

        <div className="pt-8 flex justify-center mt-auto">
          <Button variant="outline" onClick={modal.closeModal} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
