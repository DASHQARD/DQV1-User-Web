import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'
import { BranchManagerInvitationActionCell } from './BranchManagerInvitationActionCell'

export const branchManagerInvitationsListColumns = [
  {
    header: 'Email',
    accessorKey: 'branch_manager_email',
  },
  {
    header: 'Name',
    accessorKey: 'branch_manager_name',
  },
  {
    header: 'Branch',
    accessorKey: 'branch_name',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Invited At',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: BranchManagerInvitationActionCell,
  },
]

export const branchManagerInvitationsListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Email',
    accessor: 'branch_manager_email',
  },
  {
    name: 'Name',
    accessor: 'branch_manager_name',
  },
  {
    name: 'Branch',
    accessor: 'branch_name',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Invited At',
    accessor: 'created_at',
    transform: (v: any) => (v ? formatDate(v) : ''),
  },
]
