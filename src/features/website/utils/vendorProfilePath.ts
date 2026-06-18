type VendorProfileLinkFields = {
  vendor_id?: string | number | null
  gvid?: string | null
}

export function buildVendorProfileSearchParams(vendor: VendorProfileLinkFields): string {
  const params = new URLSearchParams()
  const gvid = vendor.gvid?.trim()
  if (gvid) {
    params.set('gvid', gvid)
    return params.toString()
  }
  const vendorId = vendor.vendor_id
  if (vendorId != null && String(vendorId)) {
    params.set('vendor_id', String(vendorId))
  }
  return params.toString()
}

export function buildVendorProfilePath(vendor: VendorProfileLinkFields): string {
  const query = buildVendorProfileSearchParams(vendor)
  return query ? `/vendor?${query}` : '/vendor'
}

export function buildVendorProfilePathFromGvid(gvid: string): string {
  const trimmed = gvid.trim()
  return trimmed ? `/vendor?gvid=${encodeURIComponent(trimmed)}` : '/vendor'
}
