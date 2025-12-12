/* eslint-disable react-refresh/only-export-components */
import { CustomIcon, DateCell, Dropdown, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'

export const branchListColumns = [
  {
    header: 'Branch Name',
    accessorKey: 'branch_name',
  },
  {
    header: 'Location',
    accessorKey: 'branch_location',
  },
  {
    header: 'Branch Manager',
    accessorKey: 'branch_manager_name',
  },
  {
    header: 'Manager Email',
    accessorKey: 'branch_manager_email',
  },
  {
    header: 'Date Created',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: ActionCell,
  },
]

export const branchListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Branch Name',
    accessor: 'branch_name',
  },
  {
    name: 'Location',
    accessor: 'branch_location',
  },
  {
    name: 'Branch Manager',
    accessor: 'branch_manager_name',
  },
  {
    name: 'Manager Email',
    accessor: 'branch_manager_email',
  },
  {
    name: 'Date Created',
    accessor: 'created_at',
    transform: (value) => formatDate(value),
  },
  {
    name: 'Status',
    accessor: 'status',
  },
]

function ActionCell() {
  return (
    <Dropdown actions={[]}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <CustomIcon name="MoreVertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
