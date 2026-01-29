import { Dropdown } from '@/components'
import { usePersistedModalState, useUserProfile } from '@/hooks'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import type { BranchManagerInvitation } from '@/types'
import { MODALS } from '@/utils/constants'

export function BranchManagerInvitationActionCell({
  row,
}: TableCellProps<BranchManagerInvitation>) {
  const invitation = row.original
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH_MANAGER_INVITATION.PARAM_NAME,
  })
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isCorporateSuperAdmin = userProfileData?.user_type === 'corporate super admin'

  const actions = []

  if (invitation.status === 'pending') {
    if (isCorporateSuperAdmin) {
      actions.push({
        label: 'Update',
        onClickFn: () => {
          modal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.UPDATE, { ...invitation })
        },
      })
    }
    actions.push({
      label: 'Cancel',
      onClickFn: () => {
        modal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.CANCEL, { ...invitation })
      },
    })
  }

  if (
    (invitation.status === 'accepted' || invitation.status === 'active') &&
    invitation.branch_id
  ) {
    actions.push({
      label: 'Remove Branch Manager',
      onClickFn: () => {
        modal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.REMOVE, { ...invitation })
      },
    })
  }

  actions.push({
    label: 'Delete',
    onClickFn: () => {
      modal.openModal(MODALS.BRANCH_MANAGER_INVITATION.CHILDREN.DELETE, { ...invitation })
    },
  })

  return (
    <Dropdown actions={actions}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <Icon icon="hugeicons:more-vertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
