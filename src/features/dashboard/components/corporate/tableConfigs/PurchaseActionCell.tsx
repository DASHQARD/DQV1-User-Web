import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { MODALS } from '@/utils/constants'

export function PurchaseActionCell({ row }: TableCellProps<{ id: string }>) {
  const modal = usePersistedModalState({
    paramName: MODALS.PURCHASE.PARAM_NAME,
  })
  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.PURCHASE.CHILDREN.VIEW, { ...row.original })
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
