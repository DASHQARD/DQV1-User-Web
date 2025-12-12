import { CustomIcon, DateCell, Dropdown, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'

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
    accessorKey: 'price',
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
    cell: ActionCell,
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
    accessor: 'price',
    transform: (value: any) => {
      const price = parseFloat(value as string)
      return formatCurrency(price, 'GHS')
    },
  },
  {
    name: 'Currency',
    accessor: 'currency',
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

function ActionCell() {
  return (
    <Dropdown actions={[]}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <CustomIcon name="MoreVertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
