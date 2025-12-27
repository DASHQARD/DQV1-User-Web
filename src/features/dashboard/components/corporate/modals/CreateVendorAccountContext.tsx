import React from 'react'
import type { UserProfileResponse } from '@/types/user'

export type VendorNameFormData = {
  vendor_name: string
}

export type VendorProfileFormData = {
  first_name: string
  last_name: string
  dob: string
  id_type: string
  id_number: string
  front_id?: File | null
  back_id?: File | null
  street_address?: string
}

export type VendorDetailsFormData = {
  type: 'llc' | 'sole_proprietor' | 'partnership'
  phone: string
  email: string
  street_address: string
  digital_address: string
  registration_number: string
  employer_identification_number: string
  business_industry: string
  certificate_of_incorporation?: File | null
  business_license?: File | null
  articles_of_incorporation?: File | null
  utility_bill?: File | null
  logo?: File | null
}

export interface CreateVendorAccountContextValue {
  // Step management
  step: 1 | 2 | 3
  setStep: (step: 1 | 2 | 3) => void
  goToNextStep: () => void
  goToPreviousStep: () => void

  // Form data
  vendorNameData: VendorNameFormData | null
  profileData: VendorProfileFormData | null
  vendorDetailsData: VendorDetailsFormData | null

  // Setters
  setVendorNameData: (data: VendorNameFormData) => void
  setProfileData: (data: VendorProfileFormData) => void
  setVendorDetailsData: (data: VendorDetailsFormData) => void

  // Same as corporate flags
  vendorNameSameAsCorporate: boolean
  profileSameAsCorporate: boolean
  vendorDetailsSameAsCorporate: boolean
  setVendorNameSameAsCorporate: (value: boolean) => void
  setProfileSameAsCorporate: (value: boolean) => void
  setVendorDetailsSameAsCorporate: (value: boolean) => void

  // Corporate user data
  corporateUser: UserProfileResponse | null

  // Reset function
  reset: () => void
}

export const CreateVendorAccountContext = React.createContext<
  CreateVendorAccountContextValue | undefined
>(undefined)

export function useCreateVendorAccountContext() {
  const context = React.useContext(CreateVendorAccountContext)
  if (!context) {
    throw new Error('useCreateVendorAccountContext must be used within CreateVendorAccountProvider')
  }
  return context
}
