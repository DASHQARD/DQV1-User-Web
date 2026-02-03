import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'
import { BranchManagerInvitationActionCell } from './BranchManagerInvitationActionCell'

export const branchManagerInvitationsListColumns = [
  {
    header: 'Email',
    accessorFn: (row: any) => row.branch_manager_email ?? row.email,
    cell: ({ getValue }: any) => getValue() ?? '-',
  },
  {
    header: 'Name',
    accessorFn: (row: any) => row.branch_manager_name ?? row.fullname,
    cell: ({ getValue }: any) => getValue() ?? '-',
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
    accessor: ['branch_manager_email', 'email'],
  },
  {
    name: 'Name',
    accessor: ['branch_manager_name', 'full_name'],
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
