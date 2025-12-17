import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { RequestActionCell } from './RequestActionCell'

export const requestsListColumns = [
  {
    header: 'Request ID',
    accessorKey: 'id',
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Requested By',
    accessorKey: 'requestedBy',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Date',
    accessorKey: 'date',
    cell: DateCell,
  },
  {
    header: 'Created At',
    accessorKey: 'createdAt',
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
    accessor: 'id',
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Requested By',
    accessor: 'requestedBy',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Date',
    accessor: 'date',
    transform: DateCell,
  },
  {
    name: 'Created At',
    accessor: 'createdAt',
    transform: DateCell,
  },
]
