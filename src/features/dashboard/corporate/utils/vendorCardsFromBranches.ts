/** Card row shape expected by CardItems / bulk purchase UI */
export type VendorCatalogCard = {
  card_id: number | string
  product: string
  vendor_name: string
  branch_name: string
  branch_location: string
  rating: number
  price: string
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
}

/** Flatten active vendor cards from GET /vendors/all/details `branches_with_cards` */
export function getVendorCardsFromBranches(
  vendor: VendorWithBranches | null | undefined,
): VendorCatalogCard[] {
  if (!vendor?.branches_with_cards?.length) return []

  const vendorId = vendor.vendor_id ?? vendor.id
  const vendorLabel = vendor.business_name || vendor.vendor_name || ''
  const cards: VendorCatalogCard[] = []

  for (const branch of vendor.branches_with_cards) {
    if (!branch.cards?.length) continue
    for (const raw of branch.cards) {
      const card = raw as Record<string, unknown>
      const cardType = String(card.card_type ?? card.type ?? '').toLowerCase()
      if (cardType === 'dashgo' || cardType === 'dashpro') continue
      const status = String(card.card_status ?? card.status ?? 'active').toLowerCase()
      if (status !== 'active') continue

      cards.push({
        card_id: (card.card_id ?? card.id) as number | string,
        product: String(card.card_name ?? card.product ?? 'Card'),
        vendor_name: vendorLabel,
        branch_name: String(branch.branch_name ?? ''),
        branch_location: String(branch.branch_location ?? ''),
        rating: Number(card.rating ?? 0),
        price: String(card.card_price ?? card.price ?? 0),
        currency: String(card.currency ?? 'GHS'),
        type: String(card.card_type ?? card.type ?? ''),
        description: String(card.card_description ?? card.description ?? ''),
        expiry_date: String(card.expiry_date ?? ''),
        terms_and_conditions: (card.terms_and_conditions as unknown[]) ?? [],
        images: (card.images as unknown[]) ?? [],
        status: String(card.card_status ?? card.status ?? 'active'),
        vendor_id: vendorId,
        branch_id: branch.branch_id,
        created_at: String(card.created_at ?? ''),
        updated_at: String(card.updated_at ?? card.created_at ?? ''),
      })
    }
  }

  return cards
}

export function countVendorBranches(vendor: VendorWithBranches | null | undefined): number {
  return vendor?.branches_with_cards?.length ?? 0
}
