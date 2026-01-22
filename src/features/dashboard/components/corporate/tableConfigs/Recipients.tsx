import type { CsvHeader } from '@/types'
import { RecipientActionCell } from './RecipientActionCell'
import { DateCell } from '@/components'

export const recipientsColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
  },
  {
    header: 'Email',
    accessorKey: 'email',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
  },
  {
    header: 'Message',
    accessorKey: 'message',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
  },
  {
    header: 'Quantity',
    accessorKey: 'quantity',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ getValue }: any) => {
      const value = getValue()
      return value != null && value !== '' ? value : 'N/A'
    },
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
