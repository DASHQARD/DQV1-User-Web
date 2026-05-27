import type { Dispatch, SetStateAction } from 'react'

export type CardPriceBreakdown = {
  basePrice: number
  markupPrice: number
  totalPrice: number
  currency: string
}

export interface RedemptionBranch {
  branch_name: string
  branch_location: string
}

export interface CardDetailsDocument {
  url: string
  name: string
}

export interface LightboxSlide {
  src: string
  alt: string
}

/** Card shape used on the card details page (from public catalog) */
export interface CardDetailsCard {
  product?: string
  card_name?: string
  vendor_name?: string
  vendor_id?: number | string
  price?: string | number
  base_price?: string | number
  markup_price?: string | number
  service_fee?: string | number
  currency?: string
  status?: string
  description?: string
  expiry_date?: string
  images?: { id?: unknown; file_name?: string; file_url?: string }[]
  terms_and_conditions?: { id?: unknown; file_name?: string; file_url?: string }[]
  card_id?: unknown
  id?: unknown
  type?: string
  branch_name?: string
  branch_location?: string
}

export interface UseCardDetailsReturn {
  id: string | undefined
  card: CardDetailsCard | null
  isLoading: boolean
  redemptionBranches: RedemptionBranch[]
  selectedDocument: CardDetailsDocument | null
  setSelectedDocument: Dispatch<SetStateAction<CardDetailsDocument | null>>
  selectedImageIndex: number
  setSelectedImageIndex: Dispatch<SetStateAction<number>>
  lightboxIndex: number
  openLightbox: (index: number) => void
  closeLightbox: () => void
  getCardBackground: () => string
  getCardTypeName: () => string
  handleAddToCart: () => Promise<void>
  isAdding: boolean
  lightboxImages: LightboxSlide[]
  displayPrice: number
  displayProduct: string
  vendorDisplayName: string | null
  cardBackground: string
  priceBreakdown: CardPriceBreakdown | null
  formattedExpiry: string | null
}
