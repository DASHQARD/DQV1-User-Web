import { useSearchParams } from 'react-router-dom'
import { Dropdown } from '@/components'
import { usePersistedModalState, useToast, useUserProfile } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { useVendorMutations } from '@/features/dashboard/vendor/hooks/useVendorMutations'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function VendorRequestActionCell({ row }: any) {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const useCorporateVendorScoped = isCorporateSuperAdmin && !!vendorIdFromUrl

  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useDeleteRequestVendorService } = useVendorMutations()
  const { useDeleteCorporateSuperAdminVendorRequestService } = corporateMutations()
  const { mutateAsync: deleteRequestVendor, isPending: isDeletingVendor } =
    useDeleteRequestVendorService()
  const { mutateAsync: deleteCorporateVendorRequest, isPending: isDeletingCorporateVendor } =
    useDeleteCorporateSuperAdminVendorRequestService()
  const isDeleting = isDeletingVendor || isDeletingCorporateVendor
  const { error, success } = useToast()
  const isPending = row.original.status === 'pending'

  const handleDelete = async () => {
    const requestId = row.original.id || row.original.request_id
    if (!requestId) {
      error('Request ID is required')
      return
    }

    if (
      window.confirm('Are you sure you want to delete this request? This action cannot be undone.')
    ) {
      try {
        if (useCorporateVendorScoped && vendorIdFromUrl) {
          await deleteCorporateVendorRequest({ vendorId: vendorIdFromUrl, id: requestId })
        } else {
          await deleteRequestVendor(requestId)
        }
        success('Request deleted successfully')
      } catch (err: any) {
        error(err?.message || 'Failed to delete request. Please try again.')
      }
    }
  }

  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.REQUEST.CHILDREN.VIEW, { ...row.original })
      },
    },
    ...(isPending
      ? [
          {
            label: 'Approve',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, { ...row.original })
            },
          },
          {
            label: 'Reject',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.REJECT, { ...row.original })
            },
          },
        ]
      : []),
    {
      label: 'Delete',
      onClickFn: handleDelete,
      disabled: isDeleting,
    },
  ]

  return (
    <Dropdown actions={actions}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <Icon icon="hugeicons:more-vertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
