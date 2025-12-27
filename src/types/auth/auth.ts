export type CreateAccountData = {
  user_type: string
  email: string
  password: string
  phone_number: string
  country: string
  country_code: string
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

export type PersonalDetailsWithIDData = {
  full_name: string
  street_address: string
  dob: string
  id_type: string
  id_number: string
  identification_photos: {
    file_url: string
    file_name: string
  }[]
}

export type UploadIdentificationPhotosData = {
  identification_photos: {
    file_url: string
    file_name: string
  }[]
}

export type PaymentMethodData = {
  payment_method: string
  mobile_money_provider: string
  mobile_money_number: string
  bank_name: string
  branch: string
  account_number: string
  account_name: string
  sort_swift_code: string
}

export type BusinessDetailsData = {
  name: string
  type: string
  phone: string
  email: string
  street_address: string
  digital_address: string
  registration_number: string
  country: string
  country_code: string
}

export type BusinessDetailsWithDocumentsData = {
  name: string
  type: string
  phone: string
  email: string
  street_address: string
  digital_address: string
  registration_number: string
  country: string
  country_code: string
  employer_identification_number: string
  business_industry: string
  files: {
    type: string
    file_url: string
    file_name: string
  }[]
}

export type UploadBusinessDocumentsData = {
  employer_identification_number: string
  business_industry: string
  files: {
    type: string
    file_url: string
    file_name: string
  }[]
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

export type ChangePasswordData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
