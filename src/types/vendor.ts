export type Vendor = {
  id: number
  vendor: string | null
  email: string
  phonenumber: string | null
  status: string
  branch_name: string | null
  created_at: string
  updated_at: string
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
  data: Vendor & {
    // Add any additional fields that might be in the details response
    [key: string]: any
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
