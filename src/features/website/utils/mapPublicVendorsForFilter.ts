import type { VendorLogoFields } from '@/utils/vendorLogo'
import { isCatalogCardPurchasable } from '@/utils/cardExpiry'

export type PublicVendorFilterOption = {
  id: number | string
  vendor_id?: number | string
  name: string
}

export type PublicVendorBranchRecord = {
  branch_id?: number | string
  branch_name?: string
  branch_location?: string
  cards?: Array<Record<string, unknown>>
}

export type PublicVendorRecord = VendorLogoFields & {
  vendor_id?: number | string
  id?: number | string
  business_name?: string
  vendor_name?: string
  branch_name?: string
  business_country?: string | null
  business_address?: string
  qr_url?: string
  branches_with_cards?: PublicVendorBranchRecord[]
  vendor_cards?: Array<Record<string, unknown>>
}

function branchHasPurchasableCards(branch: PublicVendorBranchRecord): boolean {
  return (branch.cards ?? []).some((card) => {
    const row = card as { card_status?: string; status?: string; expiry_date?: string | null }
    return isCatalogCardPurchasable({
      card_status: row.card_status ?? row.status,
      expiry_date: row.expiry_date,
    })
  })
}

function vendorHasCards(vendor: PublicVendorRecord): boolean {
  return (vendor.branches_with_cards ?? []).some(branchHasPurchasableCards)
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
