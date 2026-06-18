/** Extract vendor id from a request row for corporate-super-admin vendor-scoped actions. */
export function resolveVendorIdFromRequest(
  request: Record<string, unknown> | null | undefined,
): string | null {
  if (!request) return null

  const requestData = request.request_data as Record<string, unknown> | undefined
  const proposedData = requestData?.proposed_data as Record<string, unknown> | undefined
  const currentData = requestData?.current_data as Record<string, unknown> | undefined
  const entityDetails = (request.entity_details ?? request.card_details) as
    | Record<string, unknown>
    | undefined

  const candidates = [
    request.vendor_id,
    requestData?.vendor_id,
    proposedData?.vendor_id,
    currentData?.vendor_id,
    entityDetails?.vendor_id,
    entityDetails?.vendor_account_id,
    entityDetails?.entity_id,
    request.entity_id,
  ]

  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim() !== '') {
      return String(candidate)
    }
  }

  return null
}

/** Fallback when list rows omit vendor_id — match corporate vendor list. */
export function resolveVendorIdForCorporateApproval(
  request: Record<string, unknown> | null | undefined,
  corporateVendors: Array<Record<string, unknown>> | null | undefined,
): string | null {
  const direct = resolveVendorIdFromRequest(request)
  if (direct) return direct

  const vendors = corporateVendors ?? []
  if (vendors.length === 1) {
    const only = vendors[0]
    const id = only.vendor_id ?? only.id
    if (id != null && String(id).trim() !== '') return String(id)
  }

  const entityDetails = (request?.entity_details ?? request?.card_details) as
    | Record<string, unknown>
    | undefined
  const requestData = request?.request_data as Record<string, unknown> | undefined
  const proposedData = requestData?.proposed_data as Record<string, unknown> | undefined
  const currentData = requestData?.current_data as Record<string, unknown> | undefined
  const entityVendorName = String(entityDetails?.vendor_name ?? entityDetails?.name ?? '')
    .trim()
    .toLowerCase()

  if (entityVendorName) {
    const match = vendors.find((vendor) => {
      const names = [
        vendor.vendor_name,
        vendor.name,
        vendor.business_name,
      ]
        .map((n) => String(n ?? '').trim().toLowerCase())
        .filter(Boolean)
      return names.some((n) => n === entityVendorName || entityVendorName.includes(n))
    })
    if (match) {
      const id = match.vendor_id ?? match.id
      if (id != null && String(id).trim() !== '') return String(id)
    }
  }

  const gvidCandidates = [
    request?.gvid,
    requestData?.gvid,
    proposedData?.gvid,
    currentData?.gvid,
    entityDetails?.gvid,
  ]
  for (const gvid of gvidCandidates) {
    const normalized = String(gvid ?? '').trim().toLowerCase()
    if (!normalized) continue
    const match = vendors.find(
      (vendor) => String(vendor.gvid ?? '').trim().toLowerCase() === normalized,
    )
    if (match) {
      const id = match.vendor_id ?? match.id
      if (id != null && String(id).trim() !== '') return String(id)
    }
  }

  return null
}
