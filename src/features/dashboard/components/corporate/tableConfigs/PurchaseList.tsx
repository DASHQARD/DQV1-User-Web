import { DateCell, StatusCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { PurchaseActionCell } from './PurchaseActionCell'

// amount: '23.10'
// card_type: null
// created_at: '2025-12-26T12:53:57.839Z'
// currency: 'GHS'
// id: 4
// phone: '+233204517516'
// receipt_number: '#DQI12430'
// status: 'paid'
// trans_id: 'p_ca1d681f-c87f-49a9-997c-6c6593a0e551'
// type: 'checkout'
// updated_at: '2025-12-26T12:54:48.391Z'
// user_id: 1
// user_name: 'Abeeku Djokoto'
// user_type: 'corporate super admin'

export const purchasesListColumns = [
  {
    header: 'Transaction ID',
    accessorKey: 'trans_id',
  },
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
    name: 'Transaction ID',
    accessor: 'trans_id',
  },
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
