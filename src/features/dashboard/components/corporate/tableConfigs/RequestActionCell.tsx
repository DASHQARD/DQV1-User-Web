import { Dropdown } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { corporateQueries } from '@/features/dashboard/corporate/hooks/useCorporateQueries'
import { resolveVendorIdForCorporateApproval } from '@/utils/resolveVendorIdFromRequest'
import { canCorporateUserApproveRequest, isRequestApproved } from '@/utils/requestStatus'

export function RequestActionCell({ row }: any) {
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const { useGetAllVendorsManagementService } = corporateQueries()
  const { data: vendorsResponse } = useGetAllVendorsManagementService({ limit: 200 })
  const corporateVendors = Array.isArray(vendorsResponse)
    ? vendorsResponse
    : Array.isArray(vendorsResponse?.data)
      ? vendorsResponse.data
      : []
  const approvalVendorId = resolveVendorIdForCorporateApproval(row.original, corporateVendors)

  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const canApproveOrReject = canCorporateUserApproveRequest(
    row.original,
    userProfileData?.user_type,
  )
  const canDelete = !isRequestApproved(row.original.status)

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
              modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, {
                ...row.original,
                approvalVendorId,
              })
            },
          },
          {
            label: 'Reject',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.REJECT, {
                ...row.original,
                approvalVendorId,
              })
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
