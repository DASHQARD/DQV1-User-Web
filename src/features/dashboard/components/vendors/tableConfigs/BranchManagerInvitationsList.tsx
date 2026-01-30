import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'
import { BranchManagerInvitationActionCell } from './BranchManagerInvitationActionCell'

/** Supports both shapes: invitations (branch_manager_*) and branch-managers list (fullname, email) */
const emailAccessor = (row: any) => row.branch_manager_email ?? row.email ?? ''
const nameAccessor = (row: any) => row.branch_manager_name ?? row.fullname ?? ''

export const branchManagerInvitationsListColumns = [
  {
    header: 'Email',
    id: 'email',
    accessorFn: emailAccessor,
    cell: ({ getValue }: any) => getValue() ?? '—',
  },
  {
    header: 'Name',
    id: 'name',
    accessorFn: nameAccessor,
    cell: ({ getValue }: any) => getValue() ?? '—',
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
