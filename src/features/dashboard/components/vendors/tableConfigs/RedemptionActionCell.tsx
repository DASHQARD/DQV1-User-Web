import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { MODALS } from '@/utils/constants'

export function RedemptionActionCell({ row }: TableCellProps<{ id: string }>) {
  const modal = usePersistedModalState({
    paramName: MODALS.REDEMPTION.PARAM_NAME,
  })

  return (
    <button
      onClick={() => modal.openModal(MODALS.REDEMPTION.CHILDREN.VIEW, row?.original)}
      type="button"
      className="btn rounded-lg no-print cursor-pointer"
      aria-label="View actions"
    >
      <Icon
        icon="hugeicons:arrow-right-01"
        width={24}
        height={24}
        className="text-gray-500 hover:text-primary-800"
      />
    </button>
  )
}
