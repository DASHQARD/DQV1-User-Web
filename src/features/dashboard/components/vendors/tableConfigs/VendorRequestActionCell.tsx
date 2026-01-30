import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'

export function VendorRequestActionCell({ row }: any) {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const isPending = row.original.status === 'pending'

  const isRejected = String(row.original.status).toLowerCase() === 'rejected'

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
    ...(isRejected
      ? [
          {
            label: 'Approve',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, { ...row.original })
            },
          },
        ]
      : []),
    {
      label: 'Delete',
      onClickFn: () => {
        modal.openModal(MODALS.REQUEST.CHILDREN.DELETE, { ...row.original })
      },
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
