import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatFullDate } from '@/utils/format'
import { RejectAction } from './RejectAction'
import { ApproveAction } from './ApproveAction'

// --- Skeleton Loader ---
function RequestDetailsSkeleton() {
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

// Mock request detail data structure
interface RequestDetail {
  id: string
  status: string
  request_type: string
  product: string
  requested_by: string
  branch_name: string
  branch_manager_name: string
  branch_manager_email: string
  description: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

// Mock request details data
const MOCK_REQUEST_DETAILS: Record<string, RequestDetail> = {
  '1': {
    id: '1',
    status: 'pending',
    request_type: 'experience_approval',
    product: 'ShopRite Gift Card Experience',
    requested_by: 'John Smith',
    branch_name: 'Downtown Branch',
    branch_manager_name: 'John Smith',
    branch_manager_email: 'john.smith@example.com',
    description: 'Request for approval of new ShopRite gift card experience',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  '2': {
    id: '2',
    status: 'approved',
    request_type: 'experience_approval',
    product: 'Melcom Shopping Experience',
    requested_by: 'Sarah Johnson',
    branch_name: 'Midtown Branch',
    branch_manager_name: 'Sarah Johnson',
    branch_manager_email: 'sarah.johnson@example.com',
    description: 'Request for approval of Melcom shopping experience',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  '3': {
    id: '3',
    status: 'rejected',
    request_type: 'experience_approval',
    product: 'Game Stores Experience',
    requested_by: 'Bob Williams',
    branch_name: 'Uptown Branch',
    branch_manager_name: 'Bob Williams',
    branch_manager_email: 'bob.williams@example.com',
    description: 'Request for approval of Game Stores experience',
    rejection_reason: 'Experience does not meet company standards',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  '4': {
    id: '4',
    status: 'pending',
    request_type: 'branch_creation',
    product: 'New Branch - Airport Branch',
    requested_by: 'Alice Brown',
    branch_name: 'Airport Branch',
    branch_manager_name: 'Alice Brown',
    branch_manager_email: 'alice.brown@example.com',
    description: 'Request to create a new branch at the airport location',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
  '5': {
    id: '5',
    status: 'pending',
    request_type: 'experience_approval',
    product: 'MaxMart Gift Card Experience',
    requested_by: 'Charlie Davis',
    branch_name: 'South Branch',
    branch_manager_name: 'Charlie Davis',
    branch_manager_email: 'charlie.davis@example.com',
    description: 'Request for approval of MaxMart gift card experience',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
}

export function RequestDetails() {
  const modal = usePersistedModalState<{ id: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })

  // Mock data - replace with actual API call
  const requestId = modal.modalData?.id || '1'
  const data = MOCK_REQUEST_DETAILS[requestId] || MOCK_REQUEST_DETAILS['1']
  const isPending = false

  const requestInfo = [
    {
      label: 'Status',
      value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
    },
    { label: 'Request ID', value: data?.id },
    {
      label: 'Request type',
      value: data?.request_type?.split('_').join(' '),
    },
    {
      label: 'Requested by',
      value: data?.requested_by,
    },
    {
      label: 'Description',
      value: data?.description,
    },
    ...(data?.rejection_reason
      ? [
          {
            label: 'Rejection reason',
            value: data.rejection_reason,
          },
        ]
      : []),
    {
      label: 'Created at',
      value: formatFullDate(data?.created_at),
    },
    {
      label: 'Updated at',
      value: formatFullDate(data?.updated_at),
    },
  ]

  return (
    <Modal
      title="Request Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
    >
      <PrintView>
        {isPending ? (
          <RequestDetailsSkeleton />
        ) : (
          <div className="h-full px-6 flex flex-col justify-between">
            <div className="grow">
              {requestInfo.map((item) => (
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

            <div className="flex gap-3 justify-end pt-4 border-t border-t-gray-200">
              <Button onClick={() => modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE)}>
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => modal.openModal(MODALS.REQUEST.CHILDREN.REJECT)}
              >
                Reject
              </Button>
            </div>

            <RejectAction />
            <ApproveAction />
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
