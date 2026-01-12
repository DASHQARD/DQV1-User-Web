import { DateCell, CurrencyCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate } from '@/utils/format'
// import { RedemptionActionCell } from './RedemptionActionCell'

export const redemptionListColumns = [
  {
    header: 'Redemption ID',
    accessorKey: 'redemption_id',
  },
  {
    header: 'Phone Number',
    accessorKey: 'phone_number',
  },
  {
    header: 'Vendor',
    accessorKey: 'vendor_name',
  },
  {
    header: 'Branch',
    accessorKey: 'branch_name',
  },
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
    header: 'Date',
    accessorKey: 'redemption_date',
    cell: DateCell,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  // {
  //   id: 'actions',
  //   header: '',
  //   accessorKey: '',
  //   cell: RedemptionActionCell,
  // },
]

export const redemptionListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Redemption ID',
    accessor: 'redemption_id',
  },
  {
    name: 'Phone Number',
    accessor: 'phone_number',
  },
  {
    name: 'Vendor',
    accessor: 'vendor_name',
  },
  {
    name: 'Branch',
    accessor: 'branch_name',
  },
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
    name: 'Date',
    accessor: 'redemption_date',
    transform: (value) => formatDate(value),
  },
]
