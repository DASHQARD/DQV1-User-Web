import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'

import { formatCurrency, formatFullDate } from '@/utils/format'

// --- Skeleton Loader ---
function TransactionDetailsSkeleton() {
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

// Mock transaction detail data structure
interface TransactionDetail {
  id: string
  status: string
  transaction_type: string
  amount: number
  payment_source: string
  remarks: string
  transaction_reference: string
  created_at: string
}

// Mock transaction details data
const MOCK_TRANSACTION_DETAILS: Record<string, TransactionDetail> = {
  '1': {
    id: '1',
    status: 'completed',
    transaction_type: 'gift_card_purchase',
    amount: 100.0,
    payment_source: 'Mobile Money',
    remarks: 'Gift card purchase for John Doe',
    transaction_reference: 'TXN-REF-2024-001',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  '2': {
    id: '2',
    status: 'pending',
    transaction_type: 'gift_card_purchase',
    amount: 250.0,
    payment_source: 'Bank Transfer',
    remarks: 'Gift card purchase for Jane Smith',
    transaction_reference: 'TXN-REF-2024-002',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  '3': {
    id: '3',
    status: 'completed',
    transaction_type: 'gift_card_purchase',
    amount: 50.0,
    payment_source: 'Credit Card',
    remarks: 'Gift card purchase for Bob Johnson',
    transaction_reference: 'TXN-REF-2024-003',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  '6': {
    id: '6',
    status: 'completed',
    transaction_type: 'gift_card_redemption',
    amount: 75.0,
    payment_source: 'ShopRite',
    remarks: 'Gift card redeemed at ShopRite store',
    transaction_reference: 'TXN-REF-2024-006',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  '7': {
    id: '7',
    status: 'pending',
    transaction_type: 'gift_card_redemption',
    amount: 150.0,
    payment_source: 'Melcom',
    remarks: 'Gift card redemption pending at Melcom',
    transaction_reference: 'TXN-REF-2024-007',
    created_at: new Date(Date.now() - 10800000).toISOString(),
  },
  '8': {
    id: '8',
    status: 'completed',
    transaction_type: 'gift_card_redemption',
    amount: 200.0,
    payment_source: 'Game Stores',
    remarks: 'Gift card redeemed at Game Stores',
    transaction_reference: 'TXN-REF-2024-008',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
}

export function TransactionDetails() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.TRANSACTION.PARAM_NAME,
  })

  // Mock data - replace with actual API call
  const transactionId = modal.modalData?.id || '1'
  const data = MOCK_TRANSACTION_DETAILS[transactionId] || MOCK_TRANSACTION_DETAILS['1']
  const isPending = false

  const transactionInfo = [
    {
      label: 'Status',
      value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
    },
    { label: 'Transaction ID', value: data?.id },
    {
      label: 'Transaction type',
      value: data?.transaction_type?.split('_').join(' '),
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
      label: 'Remarks',
      value: data?.remarks,
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
      title="Transaction Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.TRANSACTION.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
    >
      <PrintView>
        {isPending ? (
          <TransactionDetailsSkeleton />
        ) : (
          <div className="h-full px-6 flex flex-col justify-between">
            <div className="grow">
              {transactionInfo.map((item) => (
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
