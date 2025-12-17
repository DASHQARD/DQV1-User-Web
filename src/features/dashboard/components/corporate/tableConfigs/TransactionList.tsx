import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { TransactionActionCell } from './TransactionActionCell'

export const transactionsListColumns = [
  {
    header: 'Transaction ID',
    accessorKey: 'id',
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
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
    cell: TransactionActionCell,
  },
]

export const transactionListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Transaction ID',
    accessor: 'id',
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Amount',
    accessor: 'amount',
    transform: (value: any) => {
      const amount = parseFloat(value as string)
      return formatCurrency(amount, 'GHS')
    },
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Date',
    accessor: 'date',
    transform: (value) => formatDate(value),
  },
  {
    name: 'Created At',
    accessor: 'createdAt',
    transform: (value) => formatDate(value),
  },
]
