import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'
import { ExperienceActionCell } from './ExperienceActionCell'

export const experienceListColumns = [
  {
    header: 'Product',
    accessorKey: 'product',
  },
  {
    header: 'Type',
    accessorKey: 'type',
  },
  {
    header: 'Price',
    accessorKey: 'base_price',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Date Created',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    header: 'Expiry Date',
    accessorKey: 'expiry_date',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: ExperienceActionCell,
  },
]

export const experienceListCsvHeaders: Array<CsvHeader> = [
  {
    name: 'Product',
    accessor: 'product',
  },
  {
    name: 'Type',
    accessor: 'type',
  },
  {
    name: 'Price',
    accessor: 'base_price',
    transform: (value: any) => {
      const basePrice = parseFloat(value as string)
      return formatCurrency(basePrice, 'GHS')
    },
  },
  {
    name: 'Status',
    accessor: 'status',
  },
  {
    name: 'Date Created',
    accessor: 'created_at',
    transform: (value) => formatDate(value),
  },
  {
    name: 'Expiry Date',
    accessor: 'expiry_date',
    transform: (value) => formatDate(value),
  },
]
