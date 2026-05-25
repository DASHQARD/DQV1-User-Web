import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import {
  isRequestApproved,
  isRequestAwaitingApproval,
  isRequestRejected,
} from '@/utils/requestStatus'

export function VendorRequestActionCell({ row }: any) {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const status = row.original.status
  const canApproveOrReject = isRequestAwaitingApproval(status)
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
