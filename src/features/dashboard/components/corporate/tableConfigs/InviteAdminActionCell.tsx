import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { MODALS } from '@/utils/constants'

export function InviteAdminActionCell({ row }: TableCellProps<{ id: string }>) {
  const modal = usePersistedModalState({
    paramName: MODALS.CORPORATE_ADMIN.PARAM_NAME,
  })
  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.VIEW, { ...row.original })
      },
    },
    {
      label: 'Delete Invitation',
      onClickFn: () => {
        modal.openModal(MODALS.CORPORATE_ADMIN.CHILDREN.DELETE_INVITATION, { ...row.original })
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
