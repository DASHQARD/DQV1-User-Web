import { useMemo } from 'react'
import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatFullDate } from '@/utils/format'
import { VendorRejectAction } from './VendorRejectAction'
import { VendorApproveAction } from './VendorApproveAction'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'

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

export function VendorRequestDetails() {
  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useGetRequestsVendorService } = vendorQueries()
  const { data: requestsResponse, isLoading } = useGetRequestsVendorService()

  // Extract data array from response
  const requestsList = useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse)
      ? requestsResponse
      : Array.isArray(requestsResponse?.data)
        ? requestsResponse.data
        : []
  }, [requestsResponse])

  // Find the request by id
  const data = useMemo(() => {
    const requestId = modal.modalData?.id
    if (!requestId || !requestsList.length) return null

    return requestsList.find((request: any) => {
      const id = request.id || request.request_id
      return String(id) === String(requestId) || String(request.request_id) === String(requestId)
    })
  }, [modal.modalData?.id, requestsList])

  const isPending = isLoading

  const requestInfo = useMemo(() => {
    if (!data) return []

    return [
      {
        label: 'Status',
        value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
      },
      {
        label: 'Request ID',
        value: data?.request_id || data?.id || '-',
      },
      {
        label: 'Request Type',
        value: data?.type || '-',
      },
      {
        label: 'Requested By',
        value: data?.name || '-',
      },
      {
        label: 'User Type',
        value: data?.user_type || '-',
      },
      {
        label: 'Description',
        value: data?.description || '-',
      },
      {
        label: 'Created At',
        value: formatFullDate(data?.created_at),
      },
      {
        label: 'Updated At',
        value: formatFullDate(data?.updated_at),
      },
    ]
  }, [data])

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

            {data?.status?.toLowerCase() === 'pending' && (
              <div className="flex gap-3 justify-end pt-4 border-t border-t-gray-200">
                <Button
                  onClick={() =>
                    modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, {
                      id: data.id,
                      request_id: data.request_id,
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    modal.openModal(MODALS.REQUEST.CHILDREN.REJECT, {
                      id: data.id,
                      request_id: data.request_id,
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            )}

            <VendorRejectAction />
            <VendorApproveAction />
          </div>
        )}
      </PrintView>
    </Modal>
  )
}
