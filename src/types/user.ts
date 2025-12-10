export type UserProfileResponse = {
  avatar: string | null
  bank_accounts: any[] | null
  branches:
    | {
        id: number
        branch_name: string
        branch_location: string
        branch_manager_name: string
        branch_manager_email: string
        is_single_branch: boolean
        created_at: string
      }[]
    | null
  business_details: {
    created_at: string
    digital_address: string
    email: string
    id: number
    name: string
    phone: string
    registration_number: string
    street_address: string
    type: 'sole_proprietor' | 'llc' | 'partnership'
  }[]
  business_documents: {
    business_industry: string
    created_at: string
    employer_identification_number: string
    file_name: string
    file_url: string
    id: number
    type:
      | 'certificate_of_incorporation'
      | 'business_license'
      | 'articles_of_incorporation'
      | 'utility_bill'
      | 'logo'
  }[]
  created_at: string
  default_payment_option: null
  dob: string
  email: string
  email_verified: boolean
  fullname: string
  id: number
  id_images: {
    created_at: string
    file_name: string
    file_url: string
    id: number
  }[]
  id_number: string
  id_type: string
  momo_accounts: {
    created_at: string
    id: number
    provider: string
    momo_number: string
  }[]
  onboarding_stage: string
  phonenumber: string
  status: string
  street_address: string
  updated_at: string
  user_type: string
}

export type PaymentInfoData = {
  amount: number
  card_type: string | null
  created_at: string
  currency: string
  id: number
  phone: string
  receipt_number: string
  status: string
  trans_id: string
  type: string
  updated_at: string
  user_id: number
  user_name: string
  user_type: string
}

export type PaymentResponse = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  message: string
  next: string | null
  previous: string | null
  status: string
  statusCode: number
  url: string
  data: PaymentInfoData[]
}

export type UpdateUserInfoPayload = {
  full_name: string
  dob: string
}
