import { CurrencyCell, DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'

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
    header: 'Date',
    accessorKey: 'redemption_date',
    cell: DateCell,
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
    name: 'Date',
    accessor: 'redemption_date',
  },
]
