import { StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { AdminActionCell } from './AdminActionCell'

export const adminsListColumns = [
  {
    header: 'Admin ID',
    accessorKey: 'admin_user_id',
  },
  {
    header: 'Name',
    accessorKey: 'corporate_name',
  },
  {
    header: 'Phone Number',
    accessorKey: 'phone_number',
  },
  {
    header: 'Email',
    accessorKey: 'admin_email',
  },
  {
    header: 'Status',
    accessorKey: 'admin_status',
    cell: StatusCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: AdminActionCell,
  },
]

export const adminsListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Admin ID',
    accessor: 'admin_user_id',
  },
  {
    name: 'Name',
    accessor: 'corporate_name',
  },
  {
    name: 'Phone Number',
    accessor: 'phone_number',
  },
  {
    name: 'Email',
    accessor: 'admin_email',
  },
  {
    name: 'Status',
    accessor: 'admin_status',
  },
  {
    name: 'Date',
    accessor: 'created_at',
    transform: (v: any) => (v ? new Date(v).toLocaleDateString() : ''),
  },
  {
    name: 'Created At',
    accessor: 'updated_at',
    transform: (v: any) => (v ? new Date(v).toLocaleDateString() : ''),
  },
]
