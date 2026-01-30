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

    const entityDetails = (data?.entity_details ?? data?.card_details) as
      | Record<string, unknown>
      | undefined
    const formatPrice = (price: unknown, currency?: string) =>
      price != null ? `${currency ? `${currency} ` : ''}${Number(price).toLocaleString()}` : '-'

    type RowItem = {
      label: string
      value: React.ReactNode
      isSection?: boolean
      spanFull?: boolean
      isApprovalChain?: boolean
    }

    const rows: RowItem[] = [
      {
        label: 'Status',
        value: <Tag variant={getStatusVariant(data?.status)} value={data?.status || ''} />,
      },
      { label: 'Request ID', value: data?.request_id || data?.id || '-' },
      { label: 'Request Type', value: data?.type || '-' },
      { label: 'Module', value: data?.module || '-' },
      { label: 'Requested By', value: data?.name || '-' },
      { label: 'User Type', value: data?.user_type || '-' },
      {
        label: 'Initiated By User Type',
        value: (data as any)?.initiated_by_user_type ?? '-',
      },
      { label: 'Entity ID', value: data?.entity_id ?? '-' },
      {
        label: 'Current Approver Level',
        value: (data as any)?.current_approver_level
          ? String((data as any).current_approver_level).replace(/_/g, ' ')
          : '-',
      },
      { label: 'Description', value: data?.description || '-', spanFull: true },
      { label: 'Created At', value: formatFullDate(data?.created_at) },
      { label: 'Updated At', value: formatFullDate(data?.updated_at) },
      ...(data?.reviewed_by != null
        ? [{ label: 'Reviewed By', value: String(data.reviewed_by) } as RowItem]
        : []),
      ...(data?.reviewed_at != null
        ? [{ label: 'Reviewed At', value: formatFullDate(data.reviewed_at) } as RowItem]
        : []),
      ...((data as any)?.rejection_reason
        ? [
            {
              label: 'Rejection Reason',
              value: (data as any).rejection_reason,
              spanFull: true,
            } as RowItem,
          ]
        : []),
    ]

    const approvalChain = (data as any)?.approval_chain
    if (Array.isArray(approvalChain) && approvalChain.length > 0) {
      rows.push({ label: 'Approval chain', value: '', isSection: true })
      rows.push({ label: '', value: '', isApprovalChain: true })
    }

    if (entityDetails && typeof entityDetails === 'object') {
      rows.push({ label: 'Entity / Card details', value: '', isSection: true })
      rows.push({ label: 'Product', value: (entityDetails.product as string) || '-' })
      rows.push({ label: 'Type', value: (entityDetails.type as string) || '-' })
      rows.push({
        label: 'Price',
        value: formatPrice(entityDetails.price, entityDetails.currency as string),
      })
      rows.push({ label: 'Currency', value: (entityDetails.currency as string) || '-' })
      rows.push({ label: 'Status', value: (entityDetails.status as string) || '-' })
      rows.push({
        label: 'Description',
        value: (entityDetails.description as string) || '-',
        spanFull: true,
      })
      rows.push({
        label: 'Issue Date',
        value: formatFullDate(entityDetails.issue_date as string),
      })
      rows.push({
        label: 'Expiry Date',
        value: formatFullDate(entityDetails.expiry_date as string),
      })
      rows.push({
        label: 'Is Activated',
        value:
          entityDetails.is_activated != null ? (entityDetails.is_activated ? 'Yes' : 'No') : '-',
      })
      if (entityDetails.vendor_id != null) {
        rows.push({ label: 'Vendor ID', value: String(entityDetails.vendor_id) })
      }
      rows.push({
        label: 'Created At',
        value: formatFullDate(entityDetails.created_at as string),
      })
      rows.push({
        label: 'Updated At',
        value: formatFullDate(entityDetails.updated_at as string),
      })
    }

    return rows
  }, [data])

  const approvalChain = useMemo(() => {
    const chain = (data as any)?.approval_chain
    return Array.isArray(chain) ? chain : []
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
              {requestInfo.map((item, index) => {
                if (item.isSection) {
                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className="col-span-2 pt-4 mt-2 border-t border-gray-200 first:pt-0 first:mt-0 first:border-0"
                    >
                      <p className="text-sm font-semibold text-primary-800 uppercase tracking-wide">
                        {item.label}
                      </p>
                    </div>
                  )
                }
                if ((item as { isApprovalChain?: boolean }).isApprovalChain) {
                  return (
                    <div key={`approval-chain-${index}`} className="col-span-2">
                      <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                Level
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                Status
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                Approver
                              </th>
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">
                                Reviewed At
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalChain.map((step: any, i: number) => (
                              <tr
                                key={i}
                                className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                              >
                                <td className="py-2 px-3 text-primary-800 capitalize">
                                  {step.level?.replace(/_/g, ' ') ?? '-'}
                                </td>
                                <td className="py-2 px-3">
                                  <Tag
                                    variant={getStatusVariant(step.status)}
                                    value={step.status || '-'}
                                  />
                                </td>
                                <td className="py-2 px-3 text-primary-800 capitalize">
                                  {step.approver_user_type?.replace(/_/g, ' ') ?? '-'}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  {step.reviewed_at ? formatFullDate(step.reviewed_at) : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className={`flex flex-col gap-0.5 py-2 min-w-0 ${item.spanFull ? 'col-span-2' : ''}`}
                  >
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                    <div className="text-sm text-primary-800 capitalize wrap-break-word">
                      {item.value ?? '-'}
                    </div>
                  </div>
                )
              })}
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
