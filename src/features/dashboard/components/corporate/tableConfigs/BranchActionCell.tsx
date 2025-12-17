import { Dropdown } from '@/components'
import { Icon } from '@/libs'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import type { TableCellProps } from '@/types'

export function BranchActionCell({ row }: TableCellProps<{ id: string }>) {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'View',
      onClickFn: () => {
        navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.BRANCHES}/${row.original.id}?account=vendor`)
      },
    },
    {
      label: 'Edit',
      onClickFn: () => {},
    },
    {
      label: 'Delete',
      onClickFn: () => {},
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
