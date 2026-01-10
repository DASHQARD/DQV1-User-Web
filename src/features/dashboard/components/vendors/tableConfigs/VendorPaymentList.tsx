/* eslint-disable react-refresh/only-export-components */
import { Dropdown, DateCell, CurrencyCell, StatusCell } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import type { CsvHeader, TableCellProps } from '@/types/shared'
import { formatCurrency } from '@/utils/format'
import { useToast } from '@/hooks/useToast'
import { MODALS } from '@/utils/constants'

// Helper function to format payment frequency
const formatPaymentFrequency = (freq: string | undefined): string => {
  switch (freq?.toLowerCase()) {
    case 'weekly':
      return 'Weekly'
    case 'bi_weekly':
      return 'Bi-Weekly'
    case 'monthly':
      return 'Monthly'
    case 'quarterly':
      return 'Quarterly'
    case 'custom':
      return 'Custom'
    default:
      return '-'
  }
}

// Helper function to download invoice
const handleDownloadInvoice = (paymentData: any) => {
  try {
    // Create invoice content
    const invoiceContent = `
VENDOR PAYMENT INVOICE
======================

Invoice Number: ${paymentData.invoice_number || 'N/A'}
Vendor ID: ${paymentData.vendor_id || 'N/A'}
Vendor Name: ${paymentData.vendor_name || 'N/A'}
Payment Frequency: ${formatPaymentFrequency(paymentData.payment_frequency)}
Branch Location: ${paymentData.branch_location || 'N/A'}

Payment Details:
---------------
Amount: ${formatCurrency(paymentData.amount || 0, 'GHS')}
Payment Period: ${paymentData.payment_period || 'N/A'}
Status: ${paymentData.status || 'N/A'}
Due Date: ${paymentData.due_date ? new Date(paymentData.due_date).toLocaleDateString() : 'N/A'}
${paymentData.paid_date ? `Paid Date: ${new Date(paymentData.paid_date).toLocaleDateString()}` : ''}

Description: ${paymentData.description || 'N/A'}

Generated on: ${new Date().toLocaleString()}
    `.trim()

    // Create a blob and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${paymentData.invoice_number || paymentData.id}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading invoice:', error)
  }
}

export const vendorPaymentListColumns = [
  {
    header: 'Vendor Name',
    accessorKey: 'vendor_name',
  },
  {
    header: 'Payment Frequency',
    accessorKey: 'payment_frequency',
    cell: ({ getValue }: { getValue: () => string | undefined }) => {
      const frequency = getValue()
      return <span>{formatPaymentFrequency(frequency)}</span>
    },
  },
  {
    header: 'Branch Location',
    accessorKey: 'branch_location',
  },
  {
    header: 'Payment Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
  },
  {
    header: 'Payment Period',
    accessorKey: 'payment_period',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Due Date',
    accessorKey: 'due_date',
    cell: DateCell,
  },
  {
    header: 'Paid Date',
    accessorKey: 'paid_date',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: VendorPaymentActionCell,
  },
]

export const vendorPaymentListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Vendor Name',
    accessor: 'vendor_name',
  },
  {
    name: 'Payment Frequency',
    accessor: 'payment_frequency',
  },
  {
    name: 'Branch Location',
    accessor: 'branch_location',
  },
  {
    name: 'Payment Amount',
    accessor: 'amount',
  },
  {
    name: 'Payment Period',
    accessor: 'payment_period',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Due Date',
    accessor: 'due_date',
  },
  {
    name: 'Paid Date',
    accessor: 'paid_date',
  },
]

export function VendorPaymentActionCell({ row }: TableCellProps<{ id: string }>) {
  const branchModal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })
  const toast = useToast()

  const handleDownload = () => {
    handleDownloadInvoice(row.original)
    toast.success('Invoice download started')
  }

  const handleViewBranchDetails = () => {
    // Create a minimal Branch object from payment data
    // Note: This assumes we have branch_id or we'll need to fetch full branch data
    const payment = row.original
    const branchData = payment.branch_id
      ? ({
          id: String(payment.branch_id),
          branch_location: payment.branch_location || '',
          vendor_id: payment.vendor_id,
          // Other required fields will be fetched by BranchDetailsModal via branch_id
        } as any)
      : null

    if (branchData) {
      branchModal.openModal(MODALS.BRANCH.VIEW, branchData)
    } else {
      toast.error('Branch information not available for this payment')
    }
  }

  const actions = [
    {
      label: 'View Branch Details',
      onClickFn: handleViewBranchDetails,
    },
    {
      label: 'Download Invoice',
      onClickFn: handleDownload,
    },
  ]

  return (
    <Dropdown actions={actions}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <Icon icon="hugeicons:more-vertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
