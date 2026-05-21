import React from 'react'
import { FormProvider } from 'react-hook-form'
import { Modal } from '@/components'
import { Icon } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import type { CreateVendorAccountModalData } from '@/types/corporate'
import type { UserProfileResponse } from '@/types/user'
import {
  VendorNameForm,
  VendorProfileForm,
  VendorDetailsForm,
} from '@/features/dashboard/components/vendors/forms'
import { useCreateVendorAccount } from '@/features/dashboard/components/corporate/hooks'

export function CreateVendorAccount() {
  const modal = usePersistedModalState<CreateVendorAccountModalData>({
    paramName: MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT,
  })

  const corporateUser = modal.modalData?.user || null

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
  }, [modal])

  return (
    <Modal
      position="center"
      title=""
      isOpen={modal.isModalOpen(MODALS.CORPORATE_ADMIN.CHILDREN.CREATE_VENDOR_ACCOUNT)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[800px] !max-w-[95vw]"
    >
      <CreateVendorAccountContent onClose={handleCloseModal} corporateUser={corporateUser} />
    </Modal>
  )
}

function CreateVendorAccountContent({
  onClose,
  corporateUser,
}: {
  onClose: () => void
  corporateUser: UserProfileResponse | null
}) {
  const {
    step,
    methods,
    goToPreviousStep,
    handleStep1Complete,
    handleProfileSubmit,
    handleVendorDetailsSubmit,
  } = useCreateVendorAccount({ onClose, corporateUser })

  return (
    <FormProvider {...methods}>
      <section
        className="rounded-2xl bg-white"
        style={{ boxShadow: 'rgba(228, 232, 247, 0.4) 0px 0px 80px 0px' }}
      >
        <div className="px-8 py-5">
          <button
            type="button"
            onClick={step === 1 ? onClose : goToPreviousStep}
            className="bg-[#f5f6f9] px-4 py-2 rounded-full text-[#373f51] text-sm font-semibold flex items-center gap-2"
          >
            <Icon icon="bi:arrow-left" className="text-gray-600" /> Back
          </button>
        </div>

        <section className="mx-auto w-full max-w-[720px] px-8 pb-10">
          {step === 1 ? (
            <VendorNameForm onSubmit={handleStep1Complete} corporateUser={corporateUser} />
          ) : step === 2 ? (
            <VendorProfileForm
              onSubmit={handleProfileSubmit}
              onCancel={goToPreviousStep}
              corporateUser={corporateUser}
            />
          ) : (
            <VendorDetailsForm
              onSubmit={handleVendorDetailsSubmit}
              onCancel={goToPreviousStep}
              corporateUser={corporateUser}
            />
          )}
        </section>
      </section>
    </FormProvider>
  )
}
