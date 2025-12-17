import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers/common'
import { formatCurrency, formatFullDate } from '@/utils/format'

// Mock redemption detail data structure
interface RedemptionDetail {
  id: string
  giftCardType: string
  amount: number
  status: string
  branch_id?: string
  branch_name?: string
  updated_at: string
}

// Mock redemption details data
const MOCK_REDEMPTION_DETAILS: Record<string, RedemptionDetail> = {
  '1': {
    id: '1',
    giftCardType: 'DashX',
    amount: 150.0,
    status: 'completed',
    branch_id: '1',
    branch_name: 'Accra Main Branch',
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  '2': {
    id: '2',
    giftCardType: 'DashPro',
    amount: 250.0,
    status: 'completed',
    branch_id: '1',
    branch_name: 'Accra Main Branch',
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
}

export function RedemptionDetails() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.REDEMPTION.PARAM_NAME,
  })

  // Mock data - replace with actual API call
  const redemptionId = modal.modalData?.id || '1'
  const data = MOCK_REDEMPTION_DETAILS[redemptionId] || MOCK_REDEMPTION_DETAILS['1']

  const redemptionInfo = [
    {
      label: 'Status',
      value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
    },
    { label: 'Redemption ID', value: data?.id },
    {
      label: 'Card Type',
      value: data?.giftCardType,
    },
    {
      label: 'Amount',
      value: formatCurrency(data?.amount || 0, 'GHS'),
    },
    {
      label: 'Branch',
      value: data?.branch_name || '-',
    },
    {
      label: 'Date',
      value: formatFullDate(data?.updated_at),
    },
  ]

  return (
    <Modal
      title="Redemption Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.REDEMPTION.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
    >
      <PrintView>
        <div className="h-full px-6 flex flex-col justify-between">
          <div className="grow">
            {redemptionInfo.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-1 py-3 border-t border-t-gray-200 first:border-0"
              >
                <p className="text-xs text-gray-400">{item.label}</p>
                <div className="text-sm text-gray-800">{item.value}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => modal.closeModal()} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </PrintView>
    </Modal>
  )
}
