import type { Vendor } from '@/mocks/vendor'

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

export type UpdateVendorStatusPayload = {
  user_id: number
  status: string
}

export type VendorManagerDetailsResponse = {
  status: string
  statusCode: number
  message: string
  data: VendorManagerDetails
}

export type VendorManagerDetails = {
  id: number
  name: string
  email: string
  phone: string
  country: string
  country_code: string
}

export type CreateVendorData = {
  vendor_name_details: {
    use_corporate_info: false
    vendor_name: string
  }
  personal_details: {
    use_corporate_info: false
    first_name: string
    last_name: string
    dob: string
    id_type: string
    id_number: string
    id_front_image_url: string
    id_back_image_url: string
  }
  business_details: {
    use_corporate_info: false
    type: string
    phone_number: string
    email: string
    street_address: string
    digital_address: string
    registration_number: string
    industry: string
    country: string
    country_code: string
    employer_identification_number: string
    logo: string
  }
  business_documents: {
    use_corporate_info: false
    employer_identification_number: string
    business_industry: string
    files: {
      type: string
      file_url: string
      file_name: string
    }[]
  }
}

export type AcceptVendorInvitationData = {
  token: string
  password: string
}

export type CancelVendorInvitationPayload = {
  invitation_id: string
}

export type UpdateVendorInfoPayload = {
  vendor_account_id: string
  status: string
}

export type RemoveVendorAdminPayload = {
  vendor_user_id: string
  password: string
}

export type ApproveVendorAdminPayload = {
  vendor_account_id: string
  approval_status: string
  rejection_reason: string
}

export type CreateExperienceData = {
  product: string
  description: string
  type: string
  price: number
  currency: string
  issue_date: string
  expiry_date: string
  redemption_branches: { branch_id: number }[]
  images: { file_url: string; file_name: string }[]
  terms_and_conditions: { file_url: string; file_name: string }[]
}
