import { DateCell, CurrencyCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { RedemptionActionCell } from './RedemptionActionCell'

export const redemptionListColumns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Card Type',
    accessorKey: 'giftCardType',
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: CurrencyCell,
  },
  {
    header: 'Date',
    accessorKey: 'updated_at',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: RedemptionActionCell,
  },
]

export const redemptionListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'ID',
    accessor: 'id',
  },
  {
    name: 'Card Type',
    accessor: 'giftCardType',
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
    name: 'Date',
    accessor: 'updated_at',
    transform: (value) => formatDate(value),
  },
]
