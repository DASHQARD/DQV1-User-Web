import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { PurchaseActionCell } from './PurchaseActionCell'

export const purchasesListColumns = [
  {
    header: 'Receipt Number',
    accessorKey: 'receipt_number',
  },
  {
    header: 'User Type',
    accessorKey: 'user_type',
  },
  {
    header: 'User Name',
    accessorKey: 'user_name',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
  },
  {
    header: 'Currency',
    accessorKey: 'currency',
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
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: PurchaseActionCell,
  },
]

export const purchaseListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'User Name',
    accessor: 'user_name',
  },
  {
    name: 'User Type',
    accessor: 'user_type',
  },
  {
    name: 'Receipt Number',
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
    name: 'Currency',
    accessor: 'currency',
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
    name: 'Date',
    accessor: 'date',
    transform: (value) => formatDate(value),
  },
  {
    name: 'Updated At',
    accessor: 'updated_at',
    transform: (value) => formatDate(value),
  },
]
