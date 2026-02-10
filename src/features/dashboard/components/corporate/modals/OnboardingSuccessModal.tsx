import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Text } from '@/components'
import { Button } from '@/components/Button'
import { SuccessImage } from '@/assets/images'
import { usePersistedModalState } from '@/hooks'
import { useAuthStore } from '@/stores'
import { MODALS, ROUTES } from '@/utils/constants'

export function OnboardingSuccessModal() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const userType = (user as { user_type?: string })?.user_type
  const isBranchManager = userType === 'branch'
  const isCorporateAdmin = userType === 'corporate admin'
  const isVendor = userType === 'vendor'

  const modal = usePersistedModalState({
    paramName: MODALS.ONBOARDING.PARAM_NAME,
  })

  const handleClose = useCallback(() => {
    modal.closeModal()
  }, [modal])

  const handleContinue = useCallback(() => {
    modal.closeModal()
    if (isBranchManager || isVendor || isCorporateAdmin) {
      navigate(-1)
    } else {
      const businessDetailsUrl = `${ROUTES.IN_APP.DASHBOARD.CORPORATE.COMPLIANCE.BUSINESS_DETAILS}?account=corporate`
      navigate(businessDetailsUrl)
    }
  }, [modal, navigate, isBranchManager, isVendor, isCorporateAdmin])

  const isOpen = modal.isModalOpen(MODALS.ONBOARDING.SUCCESS)

  return (
    <Modal isOpen={isOpen} setIsOpen={handleClose} panelClass="max-w-md p-8">
      <div className="flex flex-col items-center text-center">
        <img src={SuccessImage} alt="Success" className="w-24 h-24 object-contain mb-4" />
        <Text as="h2" className="text-xl font-bold text-gray-900 mb-2">
          Profile updated successfully!
        </Text>
        <Text className="text-sm text-gray-600 mb-6">
          Your identification details have been saved.
        </Text>
        <Button type="button" variant="secondary" className="w-full" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </Modal>
  )
}
