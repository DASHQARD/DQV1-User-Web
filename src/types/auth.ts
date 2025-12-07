export type CreateAccountData = {
  user_type: 'user' | 'corporate' | 'vendor'
  email: string
  password: string
}

export type LoginData = {
  email: string
  password: string
}

export type OnboardingData = {
  full_name: string
  street_address: string
  dob: string
  id_type: string
  id_number: string
}

export type UploadUserIDData = {
  identificationPhotos: {
    file_url: string
    file_name: string
  }[]
}

export type BusinessDetailsData = {
  name: string
  type: 'llc' | 'sole_proprietor' | 'partnership'
  phone: string
  email: string
  street_address: string
  digital_address: string
  registration_number: string
}

export type UploadBusinessIDData = {
  employer_identification_number: string
  business_industry: string
  files: {
    type:
      | 'certificate_of_incorporation'
      | 'business_license'
      | 'articles_of_incorporation'
      | 'utility_bill'
      | 'logo'
    file_url: string
    file_name: string
  }[]
}

export type BranchData = {
  country: string
  country_code: string
  main_branch: boolean
  is_single_branch: boolean
  branch_name: string
  branch_location: string
  branches: {
    branch_manager_name: string
    branch_manager_email: string
  }[]
}

export type AddMainBranchData = {
  country: string
  country_code: string
  is_single_branch: boolean
  branch_name: string
  branch_location: string
  branch_manager_name: string
  branch_manager_email: string
}
