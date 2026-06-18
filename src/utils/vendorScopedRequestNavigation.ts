import { MODALS, ROUTES } from '@/utils/constants'

type RequestModalData = Record<string, unknown> & {
  id?: number | string
  request_id?: string
  approvalVendorId?: string | null
}

/** Vendor → Requests URL with approve/reject modal open for corporate super admin vendor context. */
export function buildVendorScopedRequestActionUrl(
  action: 'approve' | 'reject',
  request: RequestModalData,
  vendorId: string,
): string {
  const modalAction =
    action === 'approve' ? MODALS.REQUEST.CHILDREN.APPROVE : MODALS.REQUEST.CHILDREN.REJECT
  const params = new URLSearchParams()
  params.set('account', 'vendor')
  params.set('vendor_id', vendorId)
  params.set(MODALS.REQUEST.PARAM_NAME, modalAction)
  params.set(
    'modalData',
    JSON.stringify({
      ...request,
      approvalVendorId: vendorId,
    }),
  )
  return `${ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS}?${params.toString()}`
}

export function buildCorporateVendorManagementUrl(): string {
  return ROUTES.IN_APP.DASHBOARD.CORPORATE.ALL_VENDORS
}
