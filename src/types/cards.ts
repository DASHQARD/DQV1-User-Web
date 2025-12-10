export type CardImage = {
  file_url: string
  file_name: string
}

export type CardFile = {
  file_url: string
  file_name: string
}

export type CreateCardData = {
  product: string
  description: string
  type: string
  price: number
  currency: string
  issue_date: string
  expiry_date: string
  images: CardImage[]
  terms_and_conditions: CardFile[]
}

export type UpdateCardData = {
  card_id: number
  product: string
  description: string
  type: string
  price: number
  currency: string
  issue_date: string
  expiry_date: string
  images: CardImage[]
  terms_and_conditions: CardFile[]
}

export type CardImageResponse = {
  id: number
  file_url: string
  file_name: string
  created_at?: string
  updated_at?: string
}

export type CardFileResponse = {
  id: number
  file_url: string
  file_name: string
  created_at: string
  updated_at: string
}

export type CardResponse = {
  id: number
  type: string
  product: string
  description: string
  price: string
  currency: string
  vendor_id: number
  rating: number
  issue_date: string
  expiry_date: string
  status: string
  is_activated: boolean
  fraud_flag: boolean
  fraud_notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  last_modified_by: string | null
  vendor_name: string
  images: CardImageResponse[]
  terms_and_conditions: CardFileResponse[]
}

export type CardsListResponse = {
  status: string
  statusCode: number
  message: string
  data: CardResponse[]
}

export type CardDetailResponse = {
  status: string
  statusCode: number
  message: string
  data: CardResponse
}

export type PaginationResponse = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  next: string | null
  previous: string | null
}

export type PublicCardResponse = {
  card_id: number
  vendor_id: number
  vendor_name: string | null
  product: string
  description: string
  type: 'DashX' | 'dashPass'
  price: string
  currency: string
  expiry_date: string
  status: string
  rating: number
  created_at: string
  updated_at: string
  recipient_count: string
  images: CardImageResponse[]
  terms_and_conditions: CardFileResponse[]
}

export type PublicCardsResponse = {
  status: string
  statusCode: number
  message: string
  data: PublicCardsResponse[]
  pagination: PaginationResponse
}
