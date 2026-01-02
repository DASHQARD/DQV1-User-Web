import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { RequestActionCell } from './RequestActionCell'

export const requestsListColumns = [
  {
    header: 'Request ID',
    accessorKey: 'request_id',
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Requested By',
    accessorKey: 'name',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Created At',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: RequestActionCell,
  },
]

export const requestListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Request ID',
    accessor: 'request_id',
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Requested By',
    accessor: 'name',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Created At',
    accessor: 'created_at',
    transform: (v: any) => (v ? new Date(v).toLocaleDateString() : ''),
  },
]
