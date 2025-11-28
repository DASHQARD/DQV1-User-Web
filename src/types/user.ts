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

export type PaymentInfoData =
  | {
      payment_method: 'mobile_money'
      mobile_money_provider: string
      mobile_money_number: string
      bankName?: never
      bankAccountNumber?: never
      branch?: never
      accountName?: never
      sortSwiftCode?: never
    }
  | {
      payment_method: 'bank'
      bank_name: string
      bank_account_number: string
      branch: string
      account_name: string
      sortSwiftCode: string
      mobileMoneyProvider?: never
      mobileMoneyNumber?: never
    }
