import { CurrencyCell, DateTimeCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDateTime } from '@/utils/format'

export const userRedemptionsColumns = [
  {
    header: 'Card Type',
    accessorKey: 'card_type',
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
    header: 'Branch',
    accessorKey: 'branch_name',
  },
  {
    header: 'Vendor',
    accessorKey: 'vendor_name',
  },
  {
    header: 'Date & Time',
    accessorKey: 'redemption_date',
    cell: DateTimeCell,
  },
]

export const userRedemptionsCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Card Type',
    accessor: 'card_type',
  },
  {
    name: 'Amount',
    accessor: 'amount',
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Branch',
    accessor: 'branch_name',
  },
  {
    name: 'Vendor',
    accessor: 'vendor_name',
  },
  {
    name: 'Date & Time',
    accessor: 'redemption_date',
    transform: (value) => formatDateTime(value),
  },
]
