import React from 'react'
import type { UserProfileResponse } from '@/types/user'
import {
  CreateVendorAccountContext,
  type CreateVendorAccountContextValue,
  type VendorNameFormData,
  type VendorProfileFormData,
  type VendorDetailsFormData,
} from './CreateVendorAccountContext'

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
