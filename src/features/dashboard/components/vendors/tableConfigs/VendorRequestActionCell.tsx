import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { useSearchParams } from 'react-router-dom'
import { useUserProfile } from '@/hooks'
import { canApproveAtCurrentLevel, isRequestApproved, isRequestRejected } from '@/utils/requestStatus'

export function VendorRequestActionCell({ row }: any) {
  const [searchParams] = useSearchParams()
  const vendorIdFromUrl = searchParams.get('vendor_id')
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'
  const approvalContext =
    isCorporateSuperAdmin && vendorIdFromUrl ? 'corporate-vendor-scoped' : 'vendor'

  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const status = row.original.status
  const canApproveOrReject = canApproveAtCurrentLevel(row.original, approvalContext)
  const canReApprove = isRequestRejected(status)
  const canDelete = !isRequestApproved(status)

  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.REQUEST.CHILDREN.VIEW, { ...row.original })
      },
    },
    ...(canApproveOrReject
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
    ...(canReApprove
      ? [
          {
            label: 'Approve',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, { ...row.original })
            },
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: 'Delete',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.DELETE, { ...row.original })
            },
          },
        ]
      : []),
  ]

  return (
    <Dropdown actions={actions}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <Icon icon="hugeicons:more-vertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
