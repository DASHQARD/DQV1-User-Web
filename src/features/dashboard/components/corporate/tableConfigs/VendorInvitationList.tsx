import { DateCell, StatusCell } from '@/components'
import type { CsvHeader } from '@/types'
import { VendorInvitationActionCell } from '@/features/dashboard/components/corporate/tableConfigs/VendorInvitationActionCell'

export const vendorInvitationListColumns = [
  {
    header: 'Email',
    accessorKey: 'vendor_email',
  },
  {
    header: 'Vendor Name',
    accessorKey: 'vendor_name',
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
    cell: VendorInvitationActionCell,
  },
]

export const vendorInvitationListCsvHeaders: Array<CsvHeader> = [
  { name: 'Email', accessor: 'vendor_email' },
  { name: 'Vendor Name', accessor: 'vendor_name' },
  { name: 'Status', accessor: 'status' },
  {
    name: 'Created At',
    accessor: 'created_at',
    transform: (v: unknown) => (v ? new Date(v as string).toLocaleDateString() : ''),
  },
]
