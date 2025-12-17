import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'

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

// Mock purchase detail data structure
interface PurchaseDetail {
  id: string
  status: string
  purchase_type: string
  amount: number
  payment_source: string
  recipient_name: string
  recipient_email: string
  recipient_phone: string
  card_number: string
  message: string
  transaction_reference: string
  created_at: string
}

// Mock purchase details data
const MOCK_PURCHASE_DETAILS: Record<string, PurchaseDetail> = {
  '1': {
    id: '1',
    status: 'completed',
    purchase_type: 'gift_card_purchase',
    amount: 100.0,
    payment_source: 'Mobile Money',
    recipient_name: 'John Doe',
    recipient_email: 'john.doe@example.com',
    recipient_phone: '+233241234567',
    card_number: '12345678',
    message: 'Happy Birthday!',
    transaction_reference: 'PUR-REF-2024-001',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  '2': {
    id: '2',
    status: 'pending',
    purchase_type: 'gift_card_purchase',
    amount: 250.0,
    payment_source: 'Bank Transfer',
    recipient_name: 'Jane Smith',
    recipient_email: 'jane.smith@example.com',
    recipient_phone: '+233241234568',
    card_number: '87654321',
    message: 'Thank you for your service',
    transaction_reference: 'PUR-REF-2024-002',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  '3': {
    id: '3',
    status: 'completed',
    purchase_type: 'gift_card_purchase',
    amount: 50.0,
    payment_source: 'Credit Card',
    recipient_name: 'Bob Johnson',
    recipient_email: 'bob.johnson@example.com',
    recipient_phone: '+233241234569',
    card_number: '11223344',
    message: '',
    transaction_reference: 'PUR-REF-2024-003',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  '4': {
    id: '4',
    status: 'completed',
    purchase_type: 'gift_card_purchase',
    amount: 500.0,
    payment_source: 'Mobile Money',
    recipient_name: 'Alice Williams',
    recipient_email: 'alice.williams@example.com',
    recipient_phone: '+233241234570',
    card_number: '55667788',
    message: 'Congratulations on your promotion!',
    transaction_reference: 'PUR-REF-2024-004',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  '5': {
    id: '5',
    status: 'failed',
    purchase_type: 'gift_card_purchase',
    amount: 75.0,
    payment_source: 'Bank Transfer',
    recipient_name: 'Charlie Brown',
    recipient_email: 'charlie.brown@example.com',
    recipient_phone: '+233241234571',
    card_number: '99887766',
    message: '',
    transaction_reference: 'PUR-REF-2024-005',
    created_at: new Date(Date.now() - 259200000).toISOString(),
  },
}

export function PurchaseDetails() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.PURCHASE.PARAM_NAME,
  })

  // Mock data - replace with actual API call
  const purchaseId = modal.modalData?.id || '1'
  const data = MOCK_PURCHASE_DETAILS[purchaseId] || MOCK_PURCHASE_DETAILS['1']
  const isPending = false

  const purchaseInfo = [
    {
      label: 'Status',
      value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
    },
    { label: 'Purchase ID', value: data?.id },
    {
      label: 'Purchase type',
      value: data?.purchase_type?.split('_').join(' '),
    },
    {
      label: 'Amount',
      value: `${formatCurrency(Number(data?.amount) || 0, 'GHS')}`,
    },
    {
      label: 'Payment source',
      value: data?.payment_source,
    },
    {
      label: 'Recipient name',
      value: data?.recipient_name,
    },
    {
      label: 'Recipient email',
      value: data?.recipient_email,
    },
    {
      label: 'Recipient phone',
      value: data?.recipient_phone,
    },
    {
      label: 'Card number',
      value: data?.card_number,
    },
    {
      label: 'Message',
      value: data?.message || '-',
    },
    {
      label: 'Reference number',
      value: data?.transaction_reference,
    },
    {
      label: 'Timestamp',
      value: formatFullDate(data?.created_at),
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
              <Button onClick={modal.closeModal} className="w-1/2">
                Cancel
              </Button>
              <Button className="w-1/2" variant="outline" onClick={globalThis.print}>
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
