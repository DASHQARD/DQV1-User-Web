import type { FeaturedCardProps } from '@/types'
import { resolveFeaturedCardPricingFields } from '@/features/website/pages/cardDetails/cardDetailsUtils'

/** Card row shape expected by CardItems / bulk purchase UI */
export type VendorCatalogCard = {
  card_id: number | string
  product: string
  vendor_name: string
  branch_name: string
  branch_location: string
  rating: number
  price: string
  base_price?: string | null
  markup_price?: number | null
  markup_amount?: string | number | null
  currency: string
  type: string
  description: string
  expiry_date: string
  terms_and_conditions: unknown[]
  images: unknown[]
  status: string
  vendor_id?: number | string
  branch_id?: number | string
  created_at: string
  updated_at: string
}

type VendorWithBranches = {
  vendor_id?: number | string
  id?: number | string
  vendor_name?: string
  business_name?: string
  branches_with_cards?: Array<{
    branch_id?: number | string
    branch_name?: string
    branch_location?: string
    cards?: Array<Record<string, unknown>>
  }>
  vendor_cards?: Array<Record<string, unknown>>
}

export type GetVendorCardsFromBranchesOptions = {
  /** Lowercase card types to omit (default: dashgo, dashpro for corporate flows). */
  excludeCardTypes?: string[]
  /** When true, only include cards with active status (default: true). */
  activeOnly?: boolean
}

const DEFAULT_EXCLUDE_TYPES = ['dashgo', 'dashpro']

function mapRawToCatalogCard(
  raw: Record<string, unknown>,
  ctx: {
    vendorId?: number | string
    vendorLabel: string
    branch_name?: string
    branch_location?: string
    branch_id?: number | string
  },
): VendorCatalogCard {
  const card = raw
  return {
    card_id: (card.card_id ?? card.id) as number | string,
    product: String(card.card_name ?? card.product ?? 'Card'),
    vendor_name: ctx.vendorLabel,
    branch_name: String(ctx.branch_name ?? ''),
    branch_location: String(ctx.branch_location ?? ''),
    rating: Number(card.rating ?? 0),
    price: String(card.card_price ?? card.price ?? 0),
    base_price:
      card.base_price != null && String(card.base_price) !== 'null'
        ? String(card.base_price)
        : null,
    markup_price:
      card.markup_price != null && card.markup_price !== '' ? Number(card.markup_price) : null,
    markup_amount:
      card.markup_amount != null && String(card.markup_amount) !== 'null'
        ? (card.markup_amount as string | number)
        : null,
    currency: String(card.currency ?? 'GHS'),
    type: String(card.card_type ?? card.type ?? ''),
    description: String(card.card_description ?? card.description ?? ''),
    expiry_date: String(card.expiry_date ?? ''),
    terms_and_conditions: (card.terms_and_conditions as unknown[]) ?? [],
    images: (card.images as unknown[]) ?? [],
    status: String(card.card_status ?? card.status ?? 'active'),
    vendor_id: ctx.vendorId,
    branch_id: ctx.branch_id,
    created_at: String(card.created_at ?? ''),
    updated_at: String(card.updated_at ?? card.created_at ?? ''),
  }
}

function shouldIncludeCard(
  raw: Record<string, unknown>,
  excludeCardTypes: string[],
  activeOnly: boolean,
): boolean {
  const cardType = String(raw.card_type ?? raw.type ?? '').toLowerCase()
  if (cardType && excludeCardTypes.includes(cardType)) return false
  if (activeOnly) {
    const status = String(raw.card_status ?? raw.status ?? 'active').toLowerCase()
    if (status !== 'active') return false
  }
  return true
}

/** Flatten vendor cards from GET /vendors/all/details (`branches_with_cards` and optional `vendor_cards`). */
export function getVendorCardsFromBranches(
  vendor: VendorWithBranches | null | undefined,
  options?: GetVendorCardsFromBranchesOptions,
): VendorCatalogCard[] {
  if (!vendor) return []

  const excludeCardTypes = options?.excludeCardTypes ?? DEFAULT_EXCLUDE_TYPES
  const activeOnly = options?.activeOnly ?? true
  const vendorId = vendor.vendor_id ?? vendor.id
  const vendorLabel = vendor.business_name || vendor.vendor_name || ''
  const cards: VendorCatalogCard[] = []
  const seenIds = new Set<string>()

  const pushUnique = (card: VendorCatalogCard) => {
    const key = String(card.card_id ?? '')
    if (!key || seenIds.has(key)) return
    seenIds.add(key)
    cards.push(card)
  }

  for (const branch of vendor.branches_with_cards ?? []) {
    if (!branch.cards?.length) continue
    for (const raw of branch.cards) {
      const record = raw as Record<string, unknown>
      if (!shouldIncludeCard(record, excludeCardTypes, activeOnly)) continue
      pushUnique(
        mapRawToCatalogCard(record, {
          vendorId,
          vendorLabel,
          branch_name: branch.branch_name,
          branch_location: branch.branch_location,
          branch_id: branch.branch_id,
        }),
      )
    }
  }

  for (const raw of vendor.vendor_cards ?? []) {
    const record = raw as Record<string, unknown>
    if (!shouldIncludeCard(record, excludeCardTypes, activeOnly)) continue
    pushUnique(
      mapRawToCatalogCard(record, {
        vendorId,
        vendorLabel,
      }),
    )
  }

  return cards
}

export function countVendorBranches(vendor: VendorWithBranches | null | undefined): number {
  return vendor?.branches_with_cards?.length ?? 0
}

/** Map flattened vendor catalog rows to CardItems / FeaturedCardProps. */
export function resolveFeaturedEntityId(id: string | number | undefined): string | number {
  if (id == null || id === '') return 0
  const raw = String(id).trim()
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && String(numeric) === raw) return numeric
  return raw
}

export function vendorCatalogCardToFeaturedCardProps(card: VendorCatalogCard): FeaturedCardProps {
  return {
    card_id: resolveFeaturedEntityId(card.card_id),
    product: card.product,
    vendor_name: card.vendor_name,
    branch_name: card.branch_name,
    branch_location: card.branch_location,
    description: card.description,
    ...resolveFeaturedCardPricingFields(card),
    currency: card.currency,
    expiry_date: card.expiry_date,
    status: card.status,
    rating: card.rating,
    created_at: card.created_at,
    recipient_count: '0',
    images: (card.images ?? []) as [],
    terms_and_conditions: (card.terms_and_conditions ?? []) as [],
    type: card.type,
    updated_at: card.updated_at,
    vendor_id: resolveFeaturedEntityId(card.vendor_id),
  }
}
