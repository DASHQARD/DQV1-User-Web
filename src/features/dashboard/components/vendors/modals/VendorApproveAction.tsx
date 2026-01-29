import { useSearchParams } from 'react-router-dom'
import { Button, Modal, Text } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { vendorMutations } from '@/features/dashboard/vendor/hooks'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function VendorApproveAction() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl

  const modal = usePersistedModalState<{ id: number | string; request_id?: string }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useUpdateRequestStatusService } = vendorMutations()
  const { useUpdateCorporateSuperAdminVendorRequestStatusService } = corporateMutations()
  const { mutate: updateRequestStatus, isPending: isPendingVendor } =
    useUpdateRequestStatusService()
  const { mutate: updateCorporateVendorRequestStatus, isPending: isPendingCorporateVendor } =
    useUpdateCorporateSuperAdminVendorRequestStatusService()
  const isPending = isPendingVendor || isPendingCorporateVendor

  const handleApprove = () => {
    const requestId = modal.modalData?.id
    if (!requestId) {
      console.error('Request ID is required')
      return
    }
    const id = typeof requestId === 'string' ? parseInt(requestId, 10) : requestId
    const payload = { id, status: 'approved' as const }

    if (useCorporateVendorScoped && vendorIdFromUrl) {
      updateCorporateVendorRequestStatus(
        { vendorId: vendorIdFromUrl, data: payload },
        { onSuccess: () => modal.closeModal() },
      )
    } else {
      updateRequestStatus(payload, { onSuccess: () => modal.closeModal() })
    }
  }

  return (
    <Modal
      panelClass=" "
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.APPROVE)}
      setIsOpen={modal.closeModal}
      position="center"
    >
      <div className="p-6">
        <div className="space-y-4 flex flex-col items-center justify-center">
          <Icon icon="bi:check-circle" width={48} height={48} className="text-green-500" />
          <div>
            <Text variant="h3" className="text-center font-semibold capitalize">
              Approve Request
            </Text>
            <p className="mt-4 mx-6 mb-12 text-[#5F6166] text-center">
              Are you sure you want to approve this request? Confirm action below
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant={'outline'} onClick={modal.closeModal} className="grow">
            Cancel
          </Button>
          <Button variant="secondary" loading={isPending} onClick={handleApprove} className="grow">
            Approve
          </Button>
        </div>
      </div>
    </Modal>
  )
}
