import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'

export function RequestActionCell({ row }: any) {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const normalizedStatus = String(row.original.status || '').toLowerCase().trim()
  const isAwaitingApproval =
    normalizedStatus === 'pending' ||
    normalizedStatus === 'awaiting corporate approval' ||
    (normalizedStatus.includes('awaiting') && normalizedStatus.includes('approval'))
  const isApproved = normalizedStatus === 'approved'
  const canDelete = !isApproved

  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.REQUEST.CHILDREN.VIEW, { ...row.original })
      },
    },
    ...(isAwaitingApproval
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
