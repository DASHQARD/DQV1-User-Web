import React from 'react'
import type { UserProfileResponse } from '@/types/user'

type VendorNameFormData = {
  vendor_name: string
}

type VendorProfileFormData = {
  first_name: string
  last_name: string
  dob: string
  id_type: string
  id_number: string
  front_id?: File | null
  back_id?: File | null
  street_address?: string
}

type VendorDetailsFormData = {
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

interface CreateVendorAccountContextValue {
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

const CreateVendorAccountContext = React.createContext<CreateVendorAccountContextValue | undefined>(
  undefined,
)

function useCreateVendorAccountContext() {
  const context = React.useContext(CreateVendorAccountContext)
  if (!context) {
    throw new Error('useCreateVendorAccountContext must be used within CreateVendorAccountProvider')
  }
  return context
}

export { useCreateVendorAccountContext }

interface CreateVendorAccountProviderProps {
  children: React.ReactNode
  corporateUser: UserProfileResponse | null
}

export function CreateVendorAccountProvider({
  children,
  corporateUser,
}: CreateVendorAccountProviderProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [vendorNameData, setVendorNameData] = React.useState<VendorNameFormData | null>(null)
  const [profileData, setProfileData] = React.useState<VendorProfileFormData | null>(null)
  const [vendorDetailsData, setVendorDetailsData] = React.useState<VendorDetailsFormData | null>(
    null,
  )
  const [vendorNameSameAsCorporate, setVendorNameSameAsCorporate] = React.useState(false)
  const [profileSameAsCorporate, setProfileSameAsCorporate] = React.useState(false)
  const [vendorDetailsSameAsCorporate, setVendorDetailsSameAsCorporate] = React.useState(false)

  const goToNextStep = React.useCallback(() => {
    setStep((current) => {
      if (current < 3) {
        return (current + 1) as 1 | 2 | 3
      }
      return current
    })
  }, [])

  const goToPreviousStep = React.useCallback(() => {
    setStep((current) => {
      if (current > 1) {
        return (current - 1) as 1 | 2 | 3
      }
      return current
    })
  }, [])

  const reset = React.useCallback(() => {
    setStep(1)
    setVendorNameData(null)
    setProfileData(null)
    setVendorDetailsData(null)
    setVendorNameSameAsCorporate(false)
    setProfileSameAsCorporate(false)
    setVendorDetailsSameAsCorporate(false)
  }, [])

  const value = React.useMemo<CreateVendorAccountContextValue>(
    () => ({
      step,
      setStep,
      goToNextStep,
      goToPreviousStep,
      vendorNameData,
      profileData,
      vendorDetailsData,
      setVendorNameData,
      setProfileData,
      setVendorDetailsData,
      vendorNameSameAsCorporate,
      profileSameAsCorporate,
      vendorDetailsSameAsCorporate,
      setVendorNameSameAsCorporate,
      setProfileSameAsCorporate,
      setVendorDetailsSameAsCorporate,
      corporateUser,
      reset,
    }),
    [
      step,
      goToNextStep,
      goToPreviousStep,
      vendorNameData,
      profileData,
      vendorDetailsData,
      vendorNameSameAsCorporate,
      profileSameAsCorporate,
      vendorDetailsSameAsCorporate,
      corporateUser,
      reset,
    ],
  )

  return (
    <CreateVendorAccountContext.Provider value={value}>
      {children}
    </CreateVendorAccountContext.Provider>
  )
}
