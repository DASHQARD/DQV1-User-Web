import { Dropdown } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { MODALS } from '@/utils/constants'

export function ExperienceActionCell({ row }: TableCellProps<any>) {
  const modal = usePersistedModalState({
    paramName: MODALS.EXPERIENCE.ROOT,
  })

  const actions = [
    {
      label: 'View',
      onClickFn: () => {
        modal.openModal(MODALS.EXPERIENCE.VIEW, { ...row.original })
      },
    },
    {
      label: 'Edit',
      onClickFn: () => {
        modal.openModal(MODALS.EXPERIENCE.EDIT, { ...row.original })
      },
    },
    {
      label: 'Delete',
      onClickFn: () => {
        modal.openModal(MODALS.EXPERIENCE.DELETE, { ...row.original })
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
