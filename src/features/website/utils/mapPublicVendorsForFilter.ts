export type PublicVendorFilterOption = {
  id: number | string
  vendor_id?: number
  name: string
}

type VendorBranchWithCards = {
  cards?: unknown[]
}

type PublicVendorRecord = {
  vendor_id?: number
  id?: number
  business_name?: string
  vendor_name?: string
  branch_name?: string
  branches_with_cards?: VendorBranchWithCards[]
}

function vendorHasCards(vendor: PublicVendorRecord): boolean {
  return (vendor.branches_with_cards ?? []).some((branch) => (branch.cards?.length ?? 0) > 0)
}

export function normalizePublicVendorsResponse(vendorsResponse: unknown): PublicVendorRecord[] {
  if (!vendorsResponse) return []
  if (Array.isArray(vendorsResponse)) return vendorsResponse as PublicVendorRecord[]
  const data = (vendorsResponse as { data?: PublicVendorRecord[] })?.data
  return Array.isArray(data) ? data : []
}

export function mapPublicVendorsForFilter(vendorsResponse: unknown): PublicVendorFilterOption[] {
  return normalizePublicVendorsResponse(vendorsResponse)
    .filter(vendorHasCards)
    .map((vendor) => ({
      id: vendor.vendor_id ?? vendor.id ?? 0,
      vendor_id: vendor.vendor_id,
      name: vendor.business_name || vendor.vendor_name || vendor.branch_name || 'Unknown Vendor',
    }))
}
