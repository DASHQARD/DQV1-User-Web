import type { Dispatch, SetStateAction } from 'react'

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
  vendor_name?: string
  vendor_id?: number
  price?: string | number
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
  termsUrls: Record<string | number, string>
  isLoadingImages: boolean
  isLoadingTerms: boolean
  selectedDocument: CardDetailsDocument | null
  setSelectedDocument: Dispatch<SetStateAction<CardDetailsDocument | null>>
  imageIndex: number
  setImageIndex: Dispatch<SetStateAction<number>>
  getCardBackground: () => string
  getCardTypeName: () => string
  handleAddToCart: () => Promise<void>
  isAdding: boolean
  lightboxImages: LightboxSlide[]
  displayPrice: number
  cardBackground: string
}
