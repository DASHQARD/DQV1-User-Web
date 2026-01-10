import { CurrencyCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'

export const userRedemptionsColumns = [
  {
    header: 'ID',
    accessorKey: 'id',
  },
  {
    header: 'Card Type',
    accessorKey: 'card_type',
    cell: ({ row }: any) => {
      const cardType = row.original.card_type || row.original.giftCardType || 'N/A'
      return <span className="font-medium text-gray-900">{cardType}</span>
    },
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
    cell: ({ row }: any) => {
      const branchName = row.original.branch_name || row.original.location || 'N/A'
      return <span className="text-gray-700">{branchName}</span>
    },
  },
  {
    header: 'Vendor',
    accessorKey: 'vendor_name',
    cell: ({ row }: any) => {
      const vendorName = row.original.vendor_name || row.original.business_name || 'N/A'
      return <span className="text-gray-700">{vendorName}</span>
    },
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
  },
]

export const userRedemptionsCsvHeaders: Array<CsvHeader> = [
  {
    name: 'ID',
    accessor: 'id',
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
    name: 'Branch',
    accessor: 'branch_name',
  },
  {
    name: 'Vendor',
    accessor: 'vendor_name',
  },
  {
    name: 'Date',
    accessor: 'created_at',
  },
]
