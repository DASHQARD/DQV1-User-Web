import { useSearchParams } from 'react-router-dom'
import { Modal, Text, Button } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { Icon } from '@/libs'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function VendorDeleteRequestModal() {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl

  const modal = usePersistedModalState<{
    id: number | string
    request_id?: string
    description?: string
  }>({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })

  const request = modal.modalData
  const { useDeleteRequestVendorService } = useVendorMutations()
  const { useDeleteCorporateSuperAdminVendorRequestService } = corporateMutations()
  const { mutateAsync: deleteRequestVendor, isPending: isDeletingVendor } =
    useDeleteRequestVendorService()
  const { mutateAsync: deleteCorporateVendorRequest, isPending: isDeletingCorporateVendor } =
    useDeleteCorporateSuperAdminVendorRequestService()
  const isDeleting = isDeletingVendor || isDeletingCorporateVendor

  const handleDelete = async () => {
    const requestId = request?.id ?? request?.request_id
    if (!requestId) return

    try {
      if (useCorporateVendorScoped && vendorIdFromUrl) {
        await deleteCorporateVendorRequest({ vendorId: vendorIdFromUrl, id: requestId })
      } else {
        await deleteRequestVendor(requestId)
      }
      modal.closeModal()
    } catch {
      // Error toast is handled by the mutation
    }
  }

  if (!request) return null

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.REQUEST.CHILDREN.DELETE)}
      setIsOpen={modal.closeModal}
      panelClass="!max-w-md"
      position="center"
    >
      <div className="p-6 space-y-4">
        <div className="flex flex-col gap-4 items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
          </div>
          <div className="space-y-2 text-center">
            <Text variant="h3" className="font-semibold">
              Delete Request
            </Text>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this request
              {request.request_id ? ` (${request.request_id})` : ''}? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={modal.closeModal}
            className="flex-1 rounded-full"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            className="flex-1 rounded-full"
            disabled={isDeleting}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
