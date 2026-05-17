import type { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components'
import { examplePhoneE164AtIndex, EXAMPLE_PHONE_E164 } from '@/utils/constants'

export type BulkPurchaseExample = {
  id?: string
  name: string
  email: string
  phone: string
  message: string
}

export const getBulkPurchaseExampleColumns = (): ColumnDef<BulkPurchaseExample>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Recipient Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'message',
    header: 'Message',
  },
]

export const EXAMPLE_BULK_PURCHASES: BulkPurchaseExample[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: EXAMPLE_PHONE_E164,
    message: 'Happy Birthday!',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@company.com',
    phone: examplePhoneE164AtIndex(1),
    message: 'Thank you for your service',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.j@company.com',
    phone: examplePhoneE164AtIndex(2),
    message: 'Welcome to the team!',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    phone: examplePhoneE164AtIndex(3),
    message: 'Happy Birthday!',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@company.com',
    phone: examplePhoneE164AtIndex(4),
    message: 'Thank you for your service',
  },
]
