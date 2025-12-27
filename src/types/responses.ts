export type PublicCardsResponse = {
  base_price: string
  card_id: number
  created_at: string
  currency: string
  description: string
  expiry_date: string
  images: CardImage[]
  markup_price: null
  price: string
  product: string
  rating: number
  recipient_count: string
  service_fee: string
  status: string
  terms_and_conditions: CardFile[]
  type: string
  updated_at: string
  vendor_id: number
  vendor_name: string
}[]

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
  expiry_date?: string // Optional - not allowed for DashGo and DashPro
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
  expiry_date?: string // Optional - not allowed for DashGo and DashPro
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

export type CartItemImage = {
  file_url: string
  file_name: string
}

export type CartItemResponse = {
  cart_id: number
  card_id: number
  product: string
  vendor_name?: string
  type: string
  currency: string
  price: string
  amount: string
  quantity?: number
  images?: CartItemImage[]
  cart_item_id?: number
  total_amount?: string
  total_quantity?: number
  cart_status?: string
  user_id?: number
  cart_created_at?: string
  cart_updated_at?: string
  item_count?: string
  // Legacy nested structure support
  items?: Array<{
    type: string
    images: CartItemImage[]
    card_id: number
    product: string
    cart_item_id: number
    total_amount: string
    total_quantity: number
  }>
}

export type CartListResponse = {
  cart_created_at: string
  cart_id: number
  cart_status: string
  cart_updated_at: string
  item_count: string
  items: {
    card_id: number
    cart_item_id: number
    images: CartItemImage[]
    product: string
    total_amount: string
    total_quantity: number
    type: string
  }
  total_amount: string
  user_id: number
}

export type AddToCartPayload = {
  card_id: number
  quantity: number
}

export type AssignRecipientPayload = {
  assign_to_self: boolean
  cart_item_id: number
  quantity: number
  amount: number
  message?: string
  name?: string
  email?: string
  phone?: string
}

export type RecipientResponse = {
  id: number
  cart_id: number
  name: string
  email: string
  phone: string
  message: string | null
  quantity: number
  amount: number
  status: string
  created_at: string
  updated_at: string
}

export type RecipientsListResponse = {
  status: string
  statusCode: number
  message: string
  data: RecipientResponse[]
}

export type CreateRecipientPayload = {
  name: string
  email: string
  phone: string
}

export type UpdateRecipientPayload = {
  id: number
  cart_id: number
  name: string
  email: string
  phone: string
  message: string
}

export type UpdateRecipientAmountPayload = {
  id: number
  cart_id: number
  amount: string
  name: string
  email: string
  phone: string
  message: string
}

export type Vendor = {
  id: string
  user_id: number
  branch_manager_name: string
  branch_manager_email: string
  branch_name: string
  branch_location: string
  is_single_branch: boolean
  created_at: string
  updated_at: string
  vendor_id: number
  full_branch_id: string
  gvid: string
  parent_branch_id: string | null
  branch_code: string
  branch_type: string
  status: string
  cards: VendorCards[]
  card_count: number
}

export type VendorsQueryParams = {
  limit?: number
  status?: string
  search?: string
  after?: string
}

export type VendorDetailsResponse = {
  business_name: string
  business_details_id: number
  branches_with_cards: {
    cards: {
      status: string
      card_id: number
      currency: string
      card_name: string
      card_type: string
      card_price: number
    }[]
    branch_id: number
    branch_code: string
    branch_name: string
    full_branch_id: string
    branch_location: string
  }[]
  vendor_user_id: number
  vendor_name: string
  vendor_email: string
  vendor_id: number
  gvid: string
  branch_code: string | null
  branch_name: string | null
  country: string
  created_at: string
  email: string
  full_branch_id: string | null
  id: number
  phonenumber: string
  status: string
  updated_at: string
  vendor: string
}[]

export type VendorDetails = {
  avatar: string | null
  bank_accounts: any[]
  branches: any[]
  business_details: any
  business_documents: any[]
  created_at: string
  default_payment_option: string | null
  dob: string
  email: string
  email_verified: boolean
  fullname: string
  id: number
  id_images: any[]
  id_number: string
  id_type: string
  momo_accounts: any[]
  onboarding_stage: string
  phonenumber: string
  status: string
  street_address: string
  updated_at: string
  user_type: string
  vendor_details: any
}

export type VendorCardsResponse = {
  status: string
  statusCode: number
  message: string
  data: VendorCards[]
}

export type VendorCards = {
  created_at: string
  created_by: string | null
  currency: string
  description: string
  expiry_date: string
  fraud_flag: boolean
  fraud_notes: string | null
  id: number
  images: any[]
  is_activated: boolean
  issue_date: string
  last_modified_by: string | null
  price: string
  product: string
  rating: number
  status: string
  terms_and_conditions: any[]
  type: string
  updated_at: string
  vendor_id: number
  vendor_name: string
}

export type CheckoutPayload = {
  cart_id: number
  full_name: string
  email: string
  phone_number: string
  amount_due: number
  user_id: number
}

export type CheckoutResponse = {
  status: string
  statusCode: number
  message: string
  data: string
  url: string
}

export type Customer = {
  id: number
  email: string
  phonenumber: string | null
  status: string
  fullname?: string | null
  created_at: string
  updated_at: string
  [key: string]: any
}

export type CustomersListResponse = {
  status: string
  statusCode: number
  message: string
  data: Customer[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
  url: string
}

export type CustomersQueryParams = {
  limit?: number
  status?: string
  search?: string
  after?: string
}

export type CustomerDetailsResponse = {
  status: string
  statusCode: number
  message: string
  data: Customer & {
    [key: string]: any
  }
}

export type UpdateCustomerStatusPayload = {
  user_id: string
  status: string
}

export type UpdateCustomerStatusResponse = {
  status: string
  statusCode: number
  message: string
  data?: any
}

export type CartAllRecipientsResponse = {
  card_base_price: string
  card_currency: string
  card_description: string
  card_id: number
  card_images: CardImage[]
  card_markup_price: string
  card_price: string
  card_product: string
  card_service_fee: string
  card_type: string
  cart_created_at: string
  cart_id: number
  cart_item_id: number
  cart_status: string
  expiry_date: string
  rating: number
  recipient_amount: string
  recipient_created_at: string
  recipient_email: string
  recipient_id: number
  recipient_message: string | null
  recipient_name: string
  recipient_phone: string
  recipient_quantity: number
  recipient_updated_at: string
  redemption_code: string
  total_amount: string
  total_quantity: number
  vendor_id: number
  vendor_name: string
}
