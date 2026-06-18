/** Resolve vendor user id when corporate super admin is switched to a vendor (`?vendor_id=`). */
export function resolveVendorUserIdForCorporateSwitch(
  vendorIdFromUrl: string | null | undefined,
  vendors: Array<Record<string, unknown>> | null | undefined,
): number | string | null {
  if (!vendorIdFromUrl?.trim() || !vendors?.length) return null

  const match = vendors.find((vendor) => {
    const vendorId = vendor.vendor_id ?? vendor.id
    const gvid = vendor.gvid ?? vendor.vendor_gvid
    const needle = String(vendorIdFromUrl).trim()
    return (
      String(vendorId ?? '').trim() === needle || String(gvid ?? '').trim() === needle
    )
  })

  if (!match) return null

  const userId = match.vendor_user_id ?? match.user_id
  if (userId == null || userId === '') return null
  return userId as number | string
}
