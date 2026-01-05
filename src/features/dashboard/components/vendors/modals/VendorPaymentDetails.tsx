import { Modal, Tag, PrintView } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { formatCurrency, formatFullDate } from '@/utils/format'
import type { VendorPayment } from '@/features/dashboard/vendor/services/payments'

// Helper function to get status variant
const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'gray' => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success'
    case 'pending':
      return 'warning'
    case 'overdue':
      return 'error'
    default:
      return 'gray'
  }
}

// Helper function to format payment frequency
const formatPaymentFrequency = (freq: string | undefined): string => {
  switch (freq?.toLowerCase()) {
    case 'weekly':
      return 'Weekly'
    case 'bi_weekly':
      return 'Bi-Weekly (Every 2 weeks)'
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly (Every 3 months)'
    case 'custom':
      return 'Custom'
    default:
      return '-'
  }
}

export function VendorPaymentDetails() {
  const modal = usePersistedModalState<VendorPayment>({
    paramName: MODALS.VENDOR_PAYMENT_MANAGEMENT.PARAM_NAME,
  })

  const paymentData = modal.modalData

  if (!paymentData) return null

  // Dummy payment method details
  const paymentMethodDetails: {
    method: 'mobile_money' | 'bank'
    provider?: string
    number?: string
    bank_name?: string
    bank_branch?: string
    account_name?: string
    account_number?: string
    swift_code?: string
    sort_code?: string
  } = {
    method: 'bank',
    bank_name: 'Ecobank Ghana',
    bank_branch: 'Accra Central Branch',
    account_name: 'Mart Ghana Limited',
    account_number: '0241234567890',
    swift_code: 'ECOCHGGH',
    sort_code: '001234',
  }

  const formatPaymentMethod = (method: string | undefined) => {
    switch (method) {
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank':
        return 'Bank Account'
      default:
        return 'Not set'
    }
  }

  const paymentInfo = [
    {
      label: 'Invoice Number',
      value: paymentData.invoice_number || '-',
    },
    {
      label: 'Vendor Name',
      value: paymentData.vendor_name || '-',
    },
    {
      label: 'Vendor ID',
      value: paymentData.vendor_id?.toString() || '-',
    },
    {
      label: 'Payment Frequency',
      value: formatPaymentFrequency(paymentData.payment_frequency),
    },
    {
      label: 'Branch Location',
      value: paymentData.branch_location || '-',
    },
    {
      label: 'Payment Amount',
      value: formatCurrency(paymentData.amount || 0, 'GHS'),
    },
    {
      label: 'Payment Period',
      value: paymentData.payment_period || '-',
    },
    {
      label: 'Status',
      value: (
        <Tag
          variant={getStatusVariant(paymentData.status || '')}
          value={paymentData.status || ''}
        />
      ),
    },
    {
      label: 'Due Date',
      value: paymentData.due_date ? formatFullDate(paymentData.due_date) : '-',
    },
    {
      label: 'Paid Date',
      value: paymentData.paid_date ? formatFullDate(paymentData.paid_date) : 'Not paid yet',
    },
    {
      label: 'Description',
      value: paymentData.description || '-',
    },
  ]

  return (
    <Modal
      title="Payment Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.VENDOR_PAYMENT_MANAGEMENT.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <PrintView>
        <div className="h-full px-6 flex flex-col justify-between">
          <div className="grow">
            {paymentInfo.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
              >
                <p className="text-xs text-gray-400">{item.label}</p>
                <div className="text-sm font-medium text-primary-800 capitalize">
                  {item.value || '-'}
                </div>
              </div>
            ))}

            {/* Payment Method Details Section */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="mb-4">
                <p className="text-sm font-semibold text-primary-900">Payment Method Details</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPaymentMethod(paymentMethodDetails.method)}
                </p>
              </div>

              <div className="space-y-3">
                {paymentMethodDetails.method === 'mobile_money' ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Provider</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.provider}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Mobile Money Number</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.number}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Bank Name</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.bank_name}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Branch</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.bank_branch}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Account Name</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.account_name}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">Account Number</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.account_number}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">SWIFT Code</p>
                      <div className="text-sm font-medium text-primary-800">
                        {paymentMethodDetails.swift_code}
                      </div>
                    </div>
                    {paymentMethodDetails.sort_code && (
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-400">Sort Code</p>
                        <div className="text-sm font-medium text-primary-800">
                          {paymentMethodDetails.sort_code}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </PrintView>
    </Modal>
  )
}
