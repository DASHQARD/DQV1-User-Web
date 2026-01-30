import React, { useMemo } from 'react'
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

    const card = data?.card_details as Record<string, unknown> | undefined
    const formatPrice = (price: unknown, currency?: string) =>
      price != null ? `${currency ? `${currency} ` : ''}${Number(price).toLocaleString()}` : '-'

    const rows: Array<{
      label: string
      value: React.ReactNode
      isSection?: boolean
      spanFull?: boolean
    }> = [
      {
        label: 'Status',
        value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
      },
      { label: 'Request ID', value: data?.request_id || data?.id || '-' },
      { label: 'Request Type', value: data?.type || '-' },
      { label: 'Module', value: data?.module || '-' },
      { label: 'Requested By', value: data?.name || '-' },
      { label: 'User Type', value: data?.user_type || '-' },
      { label: 'Entity ID', value: data?.entity_id ?? '-' },
      { label: 'Description', value: data?.description || '-', spanFull: true },
      { label: 'Created At', value: formatFullDate(data?.created_at) },
      { label: 'Updated At', value: formatFullDate(data?.updated_at) },
      ...(data?.reviewed_by != null
        ? [{ label: 'Reviewed By', value: String(data.reviewed_by) }]
        : []),
      ...(data?.reviewed_at != null
        ? [{ label: 'Reviewed At', value: formatFullDate(data.reviewed_at) }]
        : []),
    ]

    if (card && typeof card === 'object') {
      rows.push({ label: 'Card details', value: '', isSection: true })
      rows.push({ label: 'Product', value: (card.product as string) || '-' })
      rows.push({ label: 'Type', value: (card.type as string) || '-' })
      rows.push({ label: 'Price', value: formatPrice(card.price, card.currency as string) })
      rows.push({ label: 'Currency', value: (card.currency as string) || '-' })
      rows.push({ label: 'Status', value: (card.status as string) || '-' })
      rows.push({
        label: 'Description',
        value: (card.description as string) || '-',
        spanFull: true,
      })
      rows.push({ label: 'Issue Date', value: formatFullDate(card.issue_date as string) })
      rows.push({ label: 'Expiry Date', value: formatFullDate(card.expiry_date as string) })
      rows.push({
        label: 'Is Activated',
        value: card.is_activated != null ? (card.is_activated ? 'Yes' : 'No') : '-',
      })
      if (card.vendor_id != null) {
        rows.push({ label: 'Vendor ID', value: String(card.vendor_id) })
      }
      rows.push({ label: 'Card Created At', value: formatFullDate(card.created_at as string) })
      rows.push({ label: 'Card Updated At', value: formatFullDate(card.updated_at as string) })
    }

    return rows
  }, [data])

  return (
    <Modal
      title="Request Details"
      position="side"
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.VIEW)}
      setIsOpen={modal.closeModal}
      panelClass="!w-[864px]"
    >
      <PrintView>
        {isPending ? (
          <RequestDetailsSkeleton />
        ) : (
          <div className="h-full px-8 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              {requestInfo.map((item) =>
                item.isSection ? (
                  <div
                    key={item.label}
                    className="col-span-2 pt-4 mt-2 border-t border-gray-200 first:pt-0 first:mt-0 first:border-0"
                  >
                    <p className="text-sm font-semibold text-primary-800 uppercase tracking-wide">
                      {item.label}
                    </p>
                  </div>
                ) : (
                  <div
                    key={item.label}
                    className={`flex flex-col gap-0.5 py-2 min-w-0 ${item.spanFull ? 'col-span-2' : ''}`}
                  >
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <div className="text-sm text-primary-800 capitalize wrap-break-word">
                      {item.value ?? '-'}
                    </div>
                  </div>
                ),
              )}
            </div>

            {data?.status?.toLowerCase() === 'pending' && (
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 shrink-0">
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
