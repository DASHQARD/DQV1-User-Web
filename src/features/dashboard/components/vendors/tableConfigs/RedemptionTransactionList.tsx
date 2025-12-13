import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { RedemptionTransactionActionCell } from './RedemptionTransactionActionCell'

export const redemptionTransactionListColumns = [
  {
    header: 'Transaction ID',
    accessorKey: 'transactionId',
  },
  {
    header: 'Vendor Name',
    accessorKey: 'vendorName',
  },
  {
    header: 'Vendor Mobile',
    accessorKey: 'vendorMobile',
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
    cell: RedemptionTransactionActionCell,
  },
]

export const redemptionTransactionListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Transaction ID',
    accessor: 'transactionId',
  },
  {
    name: 'Vendor Name',
    accessor: 'vendorName',
  },
  {
    name: 'Vendor Mobile',
    accessor: 'vendorMobile',
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
