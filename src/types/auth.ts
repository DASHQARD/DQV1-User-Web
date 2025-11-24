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
  phone_number: string
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
