import React from 'react'
import { Modal, Text } from '@/components'
import { Icon } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import {
  VendorNameForm,
  VendorProfileForm,
  VendorDetailsForm,
} from '@/features/dashboard/components/vendors/forms'

type VendorNameFormData = {
  vendor_name: string
}

export function CreateVendorAccount() {
  const modal = usePersistedModalState({
    paramName: MODALS.VENDOR_ACCOUNT.CREATE,
  })

  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [vendorName, setVendorName] = React.useState('')
  const [vendorNameSameAsCorporate, setVendorNameSameAsCorporate] = React.useState(false)
  const [profileSameAsCorporate, setProfileSameAsCorporate] = React.useState(false)
  const [vendorDetailsSameAsCorporate, setVendorDetailsSameAsCorporate] = React.useState(false)

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    setStep(1)
    setVendorName('')
    setVendorNameSameAsCorporate(false)
    setProfileSameAsCorporate(false)
    setVendorDetailsSameAsCorporate(false)
  }, [modal])

  const handleBackToStep1 = React.useCallback(() => {
    setStep(1)
  }, [])

  const handleStep1Complete = (data: VendorNameFormData) => {
    setVendorName(data.vendor_name)
    setStep(2)
  }

  const handleProfileSubmit = (data: any) => {
    // TODO: Store profile data
    console.log('Profile data:', data)
    setStep(3)
  }

  const handleVendorDetailsSubmit = (data: any) => {
    // TODO: Handle final submission to create vendor account
    console.log('Creating vendor account:', {
      vendor_name: vendorName,
      profile: '...', // profile data would be stored from step 2
      vendorDetails: data,
      profileSameAsCorporate,
      vendorDetailsSameAsCorporate,
    })
    handleCloseModal()
  }

  return (
    <Modal
      position="center"
      title=""
      isOpen={modal.isModalOpen(MODALS.VENDOR_ACCOUNT.CREATE)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[1200px] max-w-[90vw]"
    >
      <CreateVendorAccountContent
        step={step}
        vendorName={vendorName}
        vendorNameSameAsCorporate={vendorNameSameAsCorporate}
        profileSameAsCorporate={profileSameAsCorporate}
        vendorDetailsSameAsCorporate={vendorDetailsSameAsCorporate}
        onStep1Complete={handleStep1Complete}
        onBackToStep1={handleBackToStep1}
        onBackToStep2={() => setStep(2)}
        onVendorNameSameAsCorporateChange={setVendorNameSameAsCorporate}
        onProfileSameAsCorporateChange={setProfileSameAsCorporate}
        onVendorDetailsSameAsCorporateChange={setVendorDetailsSameAsCorporate}
        onProfileSubmit={handleProfileSubmit}
        onVendorDetailsSubmit={handleVendorDetailsSubmit}
      />
    </Modal>
  )
}

interface CreateVendorAccountContentProps {
  step: 1 | 2 | 3
  vendorName: string
  vendorNameSameAsCorporate: boolean
  profileSameAsCorporate: boolean
  vendorDetailsSameAsCorporate: boolean
  onStep1Complete: (data: VendorNameFormData) => void
  onBackToStep1: () => void
  onBackToStep2: () => void
  onVendorNameSameAsCorporateChange: (value: boolean) => void
  onProfileSameAsCorporateChange: (value: boolean) => void
  onVendorDetailsSameAsCorporateChange: (value: boolean) => void
  onProfileSubmit: (data: any) => void
  onVendorDetailsSubmit: (data: any) => void
}

function CreateVendorAccountContent({
  step,
  vendorName,
  vendorNameSameAsCorporate,
  profileSameAsCorporate,
  vendorDetailsSameAsCorporate,
  onStep1Complete,
  onBackToStep1,
  onBackToStep2,
  onVendorNameSameAsCorporateChange,
  onProfileSameAsCorporateChange,
  onVendorDetailsSameAsCorporateChange,
  onProfileSubmit,
  onVendorDetailsSubmit,
}: CreateVendorAccountContentProps) {
  return (
    <section
      className="rounded-2xl bg-white min-h-[760px]"
      style={{
        boxShadow: 'rgba(228, 232, 247, 0.4) 0px 0px 80px 0px',
        background:
          'url(https://builds.contra.com/dda4cd83/assets/static/gradient-background-4.Z9JWGgX2.webp) 21rem / contain no-repeat rgb(255, 255, 255)',
      }}
    >
      <div className="py-5 px-4">
        <button className="bg-[#f5f6f9] px-4 py-2 rounded-full text-[#373f51] text-sm font-semibold flex items-center gap-2">
          <Icon icon="bi:arrow-left" className="text-gray-600" /> Change Account Type
        </button>
      </div>

      <section className="flex justify-between items-center gap-6 mx-auto py-10 px-12 ">
        {step === 1 ? (
          <VendorNameForm
            onSubmit={onStep1Complete}
            sameAsCorporate={vendorNameSameAsCorporate}
            onSameAsCorporateChange={onVendorNameSameAsCorporateChange}
            initialValue={vendorName}
          />
        ) : step === 2 ? (
          <VendorProfileForm
            onSubmit={onProfileSubmit}
            onCancel={onBackToStep1}
            sameAsCorporate={profileSameAsCorporate}
            onSameAsCorporateChange={onProfileSameAsCorporateChange}
          />
        ) : (
          <VendorDetailsForm
            onSubmit={onVendorDetailsSubmit}
            onCancel={onBackToStep2}
            sameAsCorporate={vendorDetailsSameAsCorporate}
            onSameAsCorporateChange={onVendorDetailsSameAsCorporateChange}
          />
        )}
        <div className="py-8 px-6 mt-[120px] max-w-[480px] w-full rounded-2xl border border-[#e5e7eb] flex gap-4 h-fit bg-white">
          <div className="w-[90px] h-[90px] rounded-full bg-[#f2f4f7] flex items-center justify-center">
            <svg
              fill="none"
              focusable="false"
              height="32"
              role="img"
              stroke-width="1"
              viewBox="0 0 24 24"
              width="32"
            >
              <path
                d="M15 11.5C13.703 11.3162 12.6838 10.297 12.5 9H11.5C11.3162 10.297 10.297 11.3162 9 11.5V12.5C10.297 12.6838 11.3162 13.703 11.5 15H12.5C12.6838 13.703 13.703 12.6838 15 12.5V11.5Z"
                fill="currentColor"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
                fill="currentColor"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M8.40627 2.3906C8.7772 1.8342 9.40166 1.5 10.0704 1.5H13.9296C14.5983 1.5 15.2228 1.8342 15.5937 2.3906L15.6133 2.41987C16.0968 3.14524 16.3386 3.50792 16.6522 3.77697C16.9839 4.0615 17.3738 4.27014 17.7945 4.38829C18.1923 4.5 18.6282 4.5 19.5 4.5C21.1569 4.5 22.5 5.84315 22.5 7.5V18C22.5 19.6569 21.1569 21 19.5 21H4.5C2.84315 21 1.5 19.6569 1.5 18V7.5C1.5 5.84315 2.84315 4.5 4.5 4.5C5.37178 4.5 5.80767 4.5 6.2055 4.38829C6.62623 4.27014 7.01608 4.0615 7.34776 3.77697C7.66139 3.50792 7.90318 3.14524 8.38675 2.41987L8.40627 2.3906ZM10.0704 3C9.90319 3 9.74708 3.08355 9.65434 3.22265L9.55173 3.37676C9.15147 3.97858 8.79931 4.50806 8.32442 4.91545C7.82689 5.34226 7.24212 5.65521 6.61102 5.83243C6.00863 6.00158 5.37274 6.00089 4.64997 6.00011L4.5 6C3.67157 6 3 6.67157 3 7.5V18C3 18.8284 3.67157 19.5 4.5 19.5H19.5C20.3284 19.5 21 18.8284 21 18V7.5C21 6.67157 20.3284 6 19.5 6L19.35 6.00011C18.6273 6.00089 17.9914 6.00159 17.389 5.83243C16.7579 5.65521 16.1731 5.34226 15.6756 4.91545C15.2007 4.50806 14.8485 3.97858 14.4483 3.37677L14.3457 3.22265C14.2529 3.08355 14.0968 3 13.9296 3H10.0704Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <div className="flex flex-col gap-6 flex-1 w-full">
            <Text variant="h2" weight="semibold" className="text-[#9ba2b0]">
              Vendor Name
            </Text>
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon icon="bi:check-circle-fill" className="text-[#059669]" />
                <div className="w-[40%] bg-[#f2f4f7] h-3 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="bi:check-circle-fill" className="text-[#059669]" />
                <div className="w-[50%] bg-[#f2f4f7] h-3 rounded-full" />
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <div className="w-full bg-[#f2f4f7] h-3 rounded-full" />
              <div className="w-[80%] bg-[#f2f4f7] h-3 rounded-full" />
            </section>
          </div>
        </div>
      </section>
    </section>
  )
}
