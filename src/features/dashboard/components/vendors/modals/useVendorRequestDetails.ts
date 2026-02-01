import React, { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { Tag } from '@/components'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers'
import { formatFullDate } from '@/utils/format'
import { vendorQueries } from '@/features/dashboard/vendor/hooks'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'

export interface RequestInfoRow {
  label: string
  value: React.ReactNode
  isSection?: boolean
  spanFull?: boolean
}

export interface UseVendorRequestDetailsReturn {
  modal: ReturnType<typeof usePersistedModalState<{ id: number | string; request_id?: string }>>
  isPending: boolean
  requestInfo: RequestInfoRow[]
  data: Record<string, unknown> | null
  openApproveModal: () => void
  openRejectModal: () => void
}

export function useVendorRequestDetails(): UseVendorRequestDetailsReturn {
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

  const requestsList = useMemo(() => {
    if (!requestsResponse) return []
    return Array.isArray(requestsResponse)
      ? requestsResponse
      : Array.isArray(requestsResponse?.data)
        ? requestsResponse.data
        : []
  }, [requestsResponse])

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
    return requestsList.find((request: { id?: unknown; request_id?: unknown }) => {
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

  const requestInfo = useMemo((): RequestInfoRow[] => {
    if (!data) return []

    const entityDetails = (data?.entity_details ?? data?.card_details) as
      | Record<string, unknown>
      | undefined
    const formatPrice = (price: unknown, currency?: string) =>
      price != null ? `${currency ? `${currency} ` : ''}${Number(price).toLocaleString()}` : '-'

    const rows: RequestInfoRow[] = [
      {
        label: 'Status',
        value: React.createElement(Tag, {
          variant: getStatusVariant(data?.status),
          value: data?.status || '',
        }),
      },
      { label: 'Request ID', value: data?.request_id || data?.id || '-' },
      { label: 'Request Type', value: data?.type || '-' },
      { label: 'Module', value: data?.module || '-' },
      { label: 'Requested By', value: data?.name || '-' },
      { label: 'User Type', value: data?.user_type || '-' },
      {
        label: 'Initiated By User Type',
        value: (data as { initiated_by_user_type?: string })?.initiated_by_user_type ?? '-',
      },
      {
        label: 'Current Approver Level',
        value: (data as { current_approver_level?: string })?.current_approver_level
          ? String((data as { current_approver_level?: string }).current_approver_level).replace(
              /_/g,
              ' ',
            )
          : '-',
      },
      { label: 'Description', value: data?.description || '-', spanFull: true },
      { label: 'Created At', value: formatFullDate(data?.created_at) },
      { label: 'Updated At', value: formatFullDate(data?.updated_at) },
      ...(data?.reviewed_by != null
        ? [{ label: 'Reviewed By', value: String(data.reviewed_by) } as RequestInfoRow]
        : []),
      ...(data?.reviewed_at != null
        ? [{ label: 'Reviewed At', value: formatFullDate(data.reviewed_at) } as RequestInfoRow]
        : []),
      ...((data as { rejection_reason?: string })?.rejection_reason
        ? [
            {
              label: 'Rejection Reason',
              value: (data as { rejection_reason?: string }).rejection_reason,
              spanFull: true,
            } as RequestInfoRow,
          ]
        : []),
    ]

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

  const openApproveModal = React.useCallback(() => {
    if (!data) return
    modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, {
      id: data.id,
      request_id: data.request_id,
    })
  }, [data, modal])

  const openRejectModal = React.useCallback(() => {
    if (!data) return
    modal.openModal(MODALS.REQUEST.CHILDREN.REJECT, {
      id: data.id,
      request_id: data.request_id,
    })
  }, [data, modal])

  return {
    modal,
    isPending,
    requestInfo,
    data,
    openApproveModal,
    openRejectModal,
  }
}
