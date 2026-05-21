import { CurrencyCell, DateTimeCell, DescriptionCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { PaymentActionCell } from './PaymentActionCell'

export const paymentListColumns = [
  {
    header: 'Receipt Number',
    accessorKey: 'receipt_number',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
  },
  {
    header: 'Type',
    accessorKey: 'type',
    cell: DescriptionCell,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Date & Time',
    accessorKey: 'created_at',
    cell: DateTimeCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: PaymentActionCell,
  },
]

export const paymentListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Receipt Number',
    accessor: 'receipt_number',
  },
  {
    name: 'Transaction ID',
    accessor: 'trans_id',
  },
  {
    name: 'Currency',
    accessor: 'currency',
  },
  {
    name: 'Amount',
    accessor: 'amount',
    transform: (value) => formatCurrency(value, 'GHS'),
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Date & Time',
    accessor: 'created_at',
    transform: (value) => formatDateTime(value),
  },
]
