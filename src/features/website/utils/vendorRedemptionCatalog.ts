import type { QueryClient } from '@tanstack/react-query'

import type {
  VendorRedemptionCatalogCard,
  VendorRedemptionCatalogData,
  VendorRedemptionCatalogVendor,
} from '@/types/redemptions'
import type { CardDetailsCard } from '@/features/website/types/cardDetails'
import type { PublicVendorRecord } from '@/features/website/utils/mapPublicVendorsForFilter'
import { isCatalogCardPurchasable } from '@/utils/cardExpiry'
import { isExactGvidPathLookup } from '@/features/website/utils/cardsRedemption'
import { normalizePublicVendorsResponse } from '@/features/website/utils/mapPublicVendorsForFilter'
import { PUBLIC_VENDORS_QUERY } from '@/features/website/constants/publicCatalog'

type BranchCardRow = Record<string, unknown>

function mapCatalogCardToBranchCardRow(card: VendorRedemptionCatalogCard): BranchCardRow {
  return {
    card_id: card.id,
    id: card.id,
    card_name: card.product,
    product: card.product,
    card_type: card.type,
    type: card.type,
    card_price: card.amount ?? card.base_price ?? 0,
    price: card.amount ?? card.base_price ?? 0,
    base_price: card.base_price,
    markup_amount: card.markup_amount,
    currency: card.currency ?? 'GHS',
    card_status: card.status,
    status: card.status ?? 'active',
    card_description: card.description,
    description: card.description,
    expiry_date: card.expiry_date,
    issue_date: card.issue_date,
    created_at: card.created_at,
    updated_at: card.updated_at,
    images: card.images ?? [],
    terms_and_conditions: card.terms_and_conditions ?? [],
    created_by_name: card.created_by_name,
  }
}

function shouldIncludeCatalogCard(card: VendorRedemptionCatalogCard): boolean {
  return isCatalogCardPurchasable({
    card_status: card.status,
    expiry_date: card.expiry_date,
  })
}

/** Map GET /redemptions/vendors/:gvid/catalog to public vendor profile shape. */
export function mapVendorRedemptionCatalogToPublicVendor(
  data: VendorRedemptionCatalogData,
): PublicVendorRecord {
  const { vendor, cards } = data
  const branchMap = new Map<
    string,
    {
      branch_id: string
      branch_name?: string
      branch_location?: string
      cards: BranchCardRow[]
    }
  >()

  for (const branch of vendor.branches ?? []) {
    branchMap.set(String(branch.id), {
      branch_id: String(branch.id),
      branch_name: branch.branch_name,
      branch_location: branch.branch_location,
      cards: [],
    })
  }

  for (const card of cards) {
    if (!shouldIncludeCatalogCard(card)) continue
    const rawCard = mapCatalogCardToBranchCardRow(card)
    const redemptionBranches = card.redemption_branches?.length
      ? card.redemption_branches
      : (vendor.branches ?? []).map((branch) => ({
          branch_id: branch.id,
          branch_name: branch.branch_name,
          branch_location: branch.branch_location,
        }))

    for (const redemptionBranch of redemptionBranches) {
      const branchId = String(redemptionBranch.branch_id)
      if (!branchMap.has(branchId)) {
        branchMap.set(branchId, {
          branch_id: branchId,
          branch_name: redemptionBranch.branch_name,
          branch_location: redemptionBranch.branch_location,
          cards: [],
        })
      }
      branchMap.get(branchId)!.cards.push(rawCard)
    }
  }

  return {
    vendor_id: vendor.vendor_id,
    business_name: vendor.vendor_name,
    vendor_name: vendor.vendor_name,
    gvid: vendor.gvid,
    qr_url: vendor.qr_code_url,
    branches_with_cards: Array.from(branchMap.values()),
  }
}

export type RedemptionCatalogVendorCard = {
  card_id: string
  card_name: string
  card_type: string
  card_price: number
  currency: string
  status: string
  branch_id?: string
  branch_name?: string
  branch_location?: string
  vendor_id?: string
  vendor_name?: string
  gvid?: string
  image_url?: string
  expiry_date?: string
  description?: string
}

export function mapCatalogCardsToVendorCards(
  cards: VendorRedemptionCatalogCard[],
  vendor?: VendorRedemptionCatalogVendor,
): RedemptionCatalogVendorCard[] {
  return cards.filter(shouldIncludeCatalogCard).map((card) => {
    const redemptionBranch = card.redemption_branches?.[0]
    const imageUrl = card.images?.[0]?.file_url ?? card.images?.[0]?.file_key
    return {
      card_id: String(card.id),
      card_name: card.product,
      card_type: String(card.type).toLowerCase(),
      card_price: Number(card.amount ?? card.base_price ?? 0),
      currency: card.currency ?? 'GHS',
      status: card.status ?? 'active',
      branch_id: redemptionBranch ? String(redemptionBranch.branch_id) : undefined,
      branch_name: redemptionBranch?.branch_name,
      branch_location: redemptionBranch?.branch_location,
      vendor_id: vendor?.vendor_id,
      vendor_name: vendor?.vendor_name,
      gvid: vendor?.gvid,
      image_url: imageUrl,
      expiry_date: card.expiry_date,
      description: card.description,
    }
  })
}

export function mapCatalogBranchesToOptions(
  vendor: VendorRedemptionCatalogVendor | undefined,
): Array<{ branch_id: string; branch_name?: string; branch_location?: string }> {
  return (vendor?.branches ?? []).map((branch) => ({
    branch_id: String(branch.id),
    branch_name: branch.branch_name,
    branch_location: branch.branch_location,
  }))
}

export function resolveGvidFromPublicVendorsCache(
  queryClient: QueryClient,
  vendorId: string,
): string {
  if (!vendorId.trim()) return ''
  const cached = queryClient.getQueryData(['public-vendors-list', PUBLIC_VENDORS_QUERY])
  const match = normalizePublicVendorsResponse(cached).find(
    (vendor) => String(vendor.vendor_id ?? vendor.id) === String(vendorId),
  )
  return match?.gvid?.trim() ?? ''
}

/** Resolve the :gvid path segment for GET /redemptions/vendors/:gvid/catalog on the vendor profile. */
export function resolveVendorProfileCatalogGvid(
  options: { gvidParam?: string; legacyVendorId?: string },
  queryClient: QueryClient,
): string {
  const gvidParam = options.gvidParam?.trim()
  if (gvidParam) return gvidParam

  const legacyVendorId = options.legacyVendorId?.trim()
  if (!legacyVendorId) return ''
  if (isExactGvidPathLookup(legacyVendorId)) return legacyVendorId

  const fromCache = resolveGvidFromPublicVendorsCache(queryClient, legacyVendorId)
  if (fromCache) return fromCache

  return legacyVendorId
}

export function mapCatalogCardToDetailsCard(
  card: VendorRedemptionCatalogCard,
  vendor?: VendorRedemptionCatalogVendor,
): CardDetailsCard {
  const redemptionBranch = card.redemption_branches?.[0]
  return {
    card_id: String(card.id),
    id: card.id,
    product: card.product,
    card_name: card.product,
    price: String(card.amount ?? card.base_price ?? 0),
    base_price: card.base_price != null ? String(card.base_price) : undefined,
    markup_price: card.markup_amount != null ? String(card.markup_amount) : undefined,
    currency: card.currency ?? 'GHS',
    type: card.type,
    status: card.status,
    expiry_date: card.expiry_date,
    description: card.description,
    images: card.images,
    terms_and_conditions: card.terms_and_conditions,
    vendor_id: vendor?.vendor_id,
    vendor_name: vendor?.vendor_name,
    gvid: vendor?.gvid,
    branch_name: redemptionBranch?.branch_name,
    branch_location: redemptionBranch?.branch_location,
    redemption_branches: card.redemption_branches,
  }
}

export function findCatalogCardInCache(
  queryClient: QueryClient,
  cardId: string,
): CardDetailsCard | null {
  const entries = queryClient.getQueriesData<{ data?: VendorRedemptionCatalogData }>({
    queryKey: ['vendor-redemption-catalog'],
  })

  for (const [, response] of entries) {
    const data = response?.data
    if (!data?.cards?.length) continue
    const match = data.cards.find((card) => String(card.id) === cardId)
    if (match) return mapCatalogCardToDetailsCard(match, data.vendor)
  }

  return null
}
