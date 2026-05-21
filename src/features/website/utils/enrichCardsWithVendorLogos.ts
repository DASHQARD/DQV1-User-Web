import type { VendorLogoFields } from '@/utils/vendorLogo'

type VendorRecord = VendorLogoFields & {
  vendor_id?: string | number
  id?: string | number
  logo_key?: string | null
}

export type CardWithVendorId = {
  vendor_id?: string | number
  [key: string]: unknown
}

function normalizeVendorList(vendorsResponse: unknown): VendorRecord[] {
  if (!vendorsResponse) return []
  if (Array.isArray(vendorsResponse)) return vendorsResponse as VendorRecord[]
  const data = (vendorsResponse as { data?: VendorRecord[] })?.data
  return Array.isArray(data) ? data : []
}

/** Build vendor_id → logo fields map from GET /vendors/all/details. */
export function buildVendorLogoMap(vendorsResponse: unknown): Map<string, VendorLogoFields> {
  const map = new Map<string, VendorLogoFields>()
  for (const vendor of normalizeVendorList(vendorsResponse)) {
    const id = String(vendor.vendor_id ?? vendor.id ?? '')
    if (!id) continue
    map.set(id, {
      logo: vendor.logo ?? null,
      logo_key: vendor.logo_key ?? null,
      business_logo: vendor.business_logo ?? null,
      vendor_logo: vendor.vendor_logo ?? null,
    })
  }
  return map
}

/** Attach vendor logo fields from /vendors/all/details onto /cards-info rows. */
export function enrichCardsWithVendorLogos<T extends CardWithVendorId>(
  cards: T[],
  vendorsResponse: unknown,
): Array<T & VendorLogoFields> {
  const logoMap = buildVendorLogoMap(vendorsResponse)
  return cards.map((card) => {
    const vendorId = card.vendor_id != null ? String(card.vendor_id) : ''
    const logos = vendorId ? logoMap.get(vendorId) : undefined
    return {
      ...card,
      logo: logos?.logo ?? null,
      logo_key: logos?.logo_key ?? null,
    }
  })
}
