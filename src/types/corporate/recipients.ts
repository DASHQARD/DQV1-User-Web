export interface RecipientRow {
  id?: number
  name: string
  email: string
  phone: string
  message?: string
}

export interface CardRecipientAssignment {
  recipientIds: number[]
  cardId?: number
  cardType: string
  vendorId?: number
  dashGoAmount?: number
  cardName?: string
  cardPrice?: number
  cardCurrency?: string
}

/** Vendor shape from public catalog / bulk purchase (has branches_with_cards) */
export interface PublicVendorWithCards {
  vendor_id?: number
  business_name?: string
  vendor_name?: string
  branches_with_cards?: unknown[]
  vendor_cards?: unknown[]
  [key: string]: unknown
}

export type RecipientDetailsData = {
  id: number
  name: string
  email: string
  phone: string
  message?: string
  amount: string
  quantity: number
  cart_item_id: number
  created_at: string
  updated_at: string
  card?: {
    id: number
    type: string
    price: number
    images: string[]
    rating: number
    card_id: string
    product: string
    currency: string
    vendor_id: number
    base_price: number
    description: string
    expiry_date: string | null
    service_fee: number
    vendor_name: string | null
    markup_price: number | null
  }
}
