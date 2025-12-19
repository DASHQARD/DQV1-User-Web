import { Text, Button } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { Icon } from '@/libs'

type RecipientData = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  message?: string
  created_at: string
  last_used?: string
}

// Mock data for recipients
const MOCK_RECIPIENTS: RecipientData[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '+233 24 123 4567',
    message: 'Happy Birthday!',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Smith',
    email: 'sarah.smith@example.com',
    phone: '+233 24 234 5678',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '+233 24 345 6789',
    message: 'Thank you for your service!',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    first_name: 'Emily',
    last_name: 'Brown',
    email: 'emily.brown@example.com',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@example.com',
    phone: '+233 24 456 7890',
    message: 'Congratulations on your promotion!',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function formatDate(timestamp: string): string {
  if (!timestamp) return 'N/A'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const year = dateObj.getFullYear()

  return `${day} ${month} ${year}`
}

function formatLastUsed(timestamp: string): string {
  if (!timestamp) return 'Never'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'Never'

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return 'Today'
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`
  }
  return formatDate(timestamp)
}

// Table columns for recipients
const recipientsColumns = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientData
      return (
        <div>
          <Text variant="span" className="text-sm font-medium text-gray-900">
            {recipient.first_name} {recipient.last_name}
          </Text>
          <Text variant="span" className="text-xs text-gray-500 block">
            {recipient.email}
          </Text>
        </div>
      )
    },
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientData
      return (
        <Text variant="span" className="text-sm text-gray-700">
          {recipient.phone || 'N/A'}
        </Text>
      )
    },
  },
  {
    header: 'Message',
    accessorKey: 'message',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientData
      return (
        <Text variant="span" className="text-sm text-gray-700">
          {recipient.message || '—'}
        </Text>
      )
    },
  },
  {
    header: 'Created',
    accessorKey: 'created_at',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientData
      return (
        <Text variant="span" className="text-xs text-gray-500">
          {formatDate(recipient.created_at)}
        </Text>
      )
    },
  },
  {
    header: 'Last Used',
    accessorKey: 'last_used',
    cell: ({ row }: any) => {
      const recipient = row.original as RecipientData
      return (
        <Text variant="span" className="text-xs text-gray-500">
          {formatLastUsed(recipient.last_used || '')}
        </Text>
      )
    },
  },
]

const recipientsCsvHeaders = [
  { name: 'First Name', accessor: 'first_name' },
  { name: 'Last Name', accessor: 'last_name' },
  { name: 'Email', accessor: 'email' },
  { name: 'Phone', accessor: 'phone' },
  { name: 'Message', accessor: 'message' },
  { name: 'Created At', accessor: 'created_at' },
  { name: 'Last Used', accessor: 'last_used' },
]

export default function Recipients() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Recipients
          </Text>
          <Button variant="secondary" className="flex items-center gap-2">
            <Icon icon="bi:person-plus-fill" className="w-4 h-4" />
            Add Recipient
          </Button>
        </div>
        <div className="relative space-y-[37px]">
          <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
            <Text variant="h6" weight="medium">
              All recipients
            </Text>
          </div>
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={recipientsColumns}
            data={MOCK_RECIPIENTS}
            total={MOCK_RECIPIENTS.length}
            loading={false}
            query={query}
            setQuery={setQuery}
            csvHeaders={recipientsCsvHeaders}
            printTitle="Recipients"
          />
        </div>
      </div>
    </div>
  )
}
