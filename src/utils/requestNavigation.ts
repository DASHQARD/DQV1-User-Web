import { MODALS, ROUTES } from '@/utils/constants'
import type { RequestEntity, RequestInboxRole } from '@/types/requests'

type RequestRef =
  | Pick<RequestEntity, 'id' | 'request_id'>
  | { id?: string | number; request_id?: string }

function requestsBasePath(role: RequestInboxRole): string {
  return role === 'corporate'
    ? ROUTES.IN_APP.DASHBOARD.CORPORATE.REQUESTS
    : ROUTES.IN_APP.DASHBOARD.VENDOR.REQUESTS
}

function accountQueryParam(role: RequestInboxRole): string | null {
  if (role === 'corporate') return 'corporate'
  if (role === 'corporate-vendor-scoped' || role === 'vendor') return 'vendor'
  return null
}

/** Deep link to view a request in the correct inbox (vendor, corporate, or CSA vendor scope). */
export function buildRequestViewUrl(
  role: RequestInboxRole,
  request: RequestRef,
  options?: { vendorId?: string | null },
): string {
  const params = new URLSearchParams()
  const account = accountQueryParam(role)
  if (account) params.set('account', account)
  if (role === 'corporate-vendor-scoped' && options?.vendorId?.trim()) {
    params.set('vendor_id', options.vendorId.trim())
  }
  params.set(MODALS.REQUEST.PARAM_NAME, MODALS.REQUEST.CHILDREN.VIEW)
  params.set(
    'modalData',
    JSON.stringify({
      id: request.id,
      request_id: request.request_id,
    }),
  )
  return `${requestsBasePath(role)}?${params.toString()}`
}

/** List page for the initiator's inbox (pending filter when supported). */
export function buildRequestsInboxUrl(
  role: RequestInboxRole,
  options?: { vendorId?: string | null; pendingOnly?: boolean },
): string {
  const params = new URLSearchParams()
  const account = accountQueryParam(role)
  if (account) params.set('account', account)
  if (role === 'corporate-vendor-scoped' && options?.vendorId?.trim()) {
    params.set('vendor_id', options.vendorId.trim())
  }
  if (options?.pendingOnly) params.set('status', 'pending')
  const query = params.toString()
  const base = requestsBasePath(role)
  return query ? `${base}?${query}` : base
}
