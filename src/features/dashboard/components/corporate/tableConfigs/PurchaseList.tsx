import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { PurchaseActionCell } from './PurchaseActionCell'

export const purchasesListColumns = [
  {
    header: 'Purchase ID',
    accessorKey: 'id',
  },
  {
    header: 'Recipient',
    accessorKey: 'recipientName',
  },
  {
    header: 'Card Number',
    accessorKey: 'cardNumber',
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
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: PurchaseActionCell,
  },
]

export const purchaseListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Purchase ID',
    accessor: 'id',
  },
  {
    name: 'Recipient',
    accessor: 'recipientName',
  },
  {
    name: 'Card Number',
    accessor: 'cardNumber',
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
