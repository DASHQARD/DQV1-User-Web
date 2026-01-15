import type { CsvHeader } from '@/types'
import { RecipientActionCell } from './RecipientActionCell'
import { DateCell } from '@/components'

export const recipientsColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Email',
    accessorKey: 'email',
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
  },
  {
    header: 'Message',
    accessorKey: 'message',
  },
  {
    header: 'Quantity',
    accessorKey: 'quantity',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
  },
  {
    header: 'Created At',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    header: 'Actions',
    accessorKey: 'actions',
    cell: RecipientActionCell,
  },
]

export const recipientsCsvHeaders: Array<CsvHeader> = [
  { name: 'Name', accessor: 'name' },
  { name: 'Email', accessor: 'email' },
  { name: 'Phone', accessor: 'phone' },
  { name: 'Message', accessor: 'message' },
  { name: 'Quantity', accessor: 'quantity' },
  { name: 'Amount', accessor: 'amount' },
  {
    name: 'Created At',
    accessor: 'created_at',
    transform: (v: any) => (v ? new Date(v).toLocaleDateString() : ''),
  },
]
