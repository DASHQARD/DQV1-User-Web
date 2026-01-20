import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { TransactionActionCell } from './TransactionActionCell'

export const transactionsListColumns = [
  {
    header: 'Receipt ID',
    accessorKey: 'receipt_number',
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
    header: 'Created At',
    accessorKey: 'created_at',
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
    name: 'Receipt ID',
    accessor: 'receipt_number',
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
    name: 'Created At',
    accessor: 'created_at',
    transform: (value) => formatDate(value),
  },
]
