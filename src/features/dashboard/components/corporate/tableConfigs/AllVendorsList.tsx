import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { AllVendorsActionCell } from './AllVendorsActionCell'

export const allVendorsListColumns = [
  {
    header: 'Vendor Name',
    accessorKey: 'vendor_name',
  },
  {
    header: 'Business Name',
    accessorKey: 'business_name',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: StatusCell,
  },
  {
    header: 'Created At',
    accessorKey: 'created_at',
    cell: DateCell,
  },
  {
    id: 'actions',
    header: '',
    accessorKey: '',
    cell: AllVendorsActionCell,
  },
]

export const allVendorsListCsvHeaders: Array<CsvHeader> = [
  { name: 'Vendor Name', accessor: 'vendor_name' },
  { name: 'Business Name', accessor: 'business_name' },
  { name: 'Status', accessor: 'status' },
  {
    name: 'Created At',
    accessor: 'created_at',
    transform: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : ''),
  },
]
