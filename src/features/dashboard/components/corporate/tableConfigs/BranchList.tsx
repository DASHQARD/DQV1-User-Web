import { StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'
import { BranchActionCell } from './BranchActionCell'

export const branchListColumns = [
  {
    header: 'Branch Name',
    accessorKey: 'branch_name',
  },
  {
    header: 'Location',
    accessorKey: 'branch_location',
  },
  // {
  //   header: 'Payment Method',
  //   accessorKey: 'payment_method',
  // },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: BranchActionCell,
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
