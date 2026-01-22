import { CurrencyCell, DateCell, DescriptionCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
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
    header: 'Updated At',
    accessorKey: 'created_at',
    cell: DateCell,
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
    name: 'Amount',
    accessor: 'amount',
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
]
