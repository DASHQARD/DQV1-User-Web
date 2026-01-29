import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Modal, PrintView, Tag } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatFullDate } from '@/utils/format'
import { VendorRejectAction } from './VendorRejectAction'
import { VendorApproveAction } from './VendorApproveAction'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { RequestDetailsSkeleton } from './skeletons'

export function VendorRequestDetails() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')

  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const userType = userProfileData?.user_type
  const isCorporateSuperAdmin = userType === 'corporate super admin'
  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl

  const { useGetRequestsVendorService, useGetRequestVendorInfoService } = vendorQueries()
  const { useGetCorporateRequestByIdService, useGetCorporateSuperAdminVendorRequestInfoService } =
    corporateQueries()

  const requestId = modal.modalData?.id ?? null

  const { data: requestsResponse, isLoading: isLoadingVendorRequests } =
    useGetRequestsVendorService(useCorporateVendorScoped ? undefined : {})

  const { data: corporateRequestResponse, isLoading: isLoadingCorporateRequest } =
    useGetCorporateRequestByIdService(
      isCorporateSuperAdmin && !vendorIdFromUrl && requestId ? requestId : null,
    )

  const { data: corporateVendorRequestResponse, isLoading: isLoadingCorporateVendorRequest } =
    useGetCorporateSuperAdminVendorRequestInfoService(
      useCorporateVendorScoped && requestId ? vendorIdFromUrl! : null,
      useCorporateVendorScoped && requestId ? requestId : null,
    )

  const { data: vendorRequestInfoResponse, isLoading: isLoadingVendorRequestInfo } =
    useGetRequestVendorInfoService(!isCorporateSuperAdmin && requestId ? requestId : null)

  // Extract data array from response (for vendor requests fallback)
  const requestsList = useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse)
      ? requestsResponse
      : Array.isArray(requestsResponse?.data)
        ? requestsResponse.data
        : []
  }, [requestsResponse])

  // Find the request by id: corporate+vendor_id → vendor-scoped get; corporate → corporate get; vendor → vendor get or list
  const data = useMemo(() => {
    if (useCorporateVendorScoped && corporateVendorRequestResponse) {
      return corporateVendorRequestResponse?.data || corporateVendorRequestResponse || null
    }
    if (isCorporateSuperAdmin && !vendorIdFromUrl && corporateRequestResponse) {
      return corporateRequestResponse?.data || corporateRequestResponse || null
    }
    if (!isCorporateSuperAdmin && vendorRequestInfoResponse) {
      return vendorRequestInfoResponse?.data || vendorRequestInfoResponse || null
    }
    if (!requestId || !requestsList.length) return null
    return requestsList.find((request: any) => {
      const id = request.id || request.request_id
      return String(id) === String(requestId) || String(request.request_id) === String(requestId)
    })
  }, [
    useCorporateVendorScoped,
    corporateVendorRequestResponse,
    isCorporateSuperAdmin,
    vendorIdFromUrl,
    corporateRequestResponse,
    requestId,
    requestsList,
    vendorRequestInfoResponse,
  ])

  const isPending =
    isLoadingVendorRequests ||
    isLoadingCorporateRequest ||
    isLoadingCorporateVendorRequest ||
    (!isCorporateSuperAdmin && !!requestId && isLoadingVendorRequestInfo)

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
                  variant="secondary"
                  loading={isPending}
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
