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

export type VendorsListResponse = {
  status: string
  statusCode: number
  message: string
  data: Vendor[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
  url: string
}

export type VendorsQueryParams = {
  limit?: number
  status?: string
  search?: string
  after?: string
}

export type VendorDetailsResponse = {
  status: string
  statusCode: number
  message: string
  data: Vendor[]
  pagination: {
    limit: number
    hasNextPage: boolean
    next: string | null
  }
}

export type UpdateVendorStatusPayload = {
  user_id: number
  status: string
}

export type UpdateVendorStatusResponse = {
  status: string
  statusCode: number
  message: string
  data?: any
}

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
