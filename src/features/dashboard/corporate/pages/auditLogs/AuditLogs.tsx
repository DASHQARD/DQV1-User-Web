import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { cn } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants'
import type { QueryType } from '@/types'
import { useReducerSpread } from '@/hooks'
import { corporate } from '../../hooks'

type ActivityData = {
  id: string
  actor_name?: string
  actor_type?: string
  action: string
  new_values?: Record<string, any>
  created_at: string
}

const actionStyles: Record<'Create' | 'Modify', string> = {
  Create: 'text-success-600',
  Modify: 'text-warning-400',
}

function getActionType(action: string): 'Create' | 'Modify' {
  const lowerAction = action.toLowerCase()

  if (
    lowerAction.includes('create') ||
    lowerAction.includes('created') ||
    lowerAction.includes('add') ||
    lowerAction.includes('new')
  ) {
    return 'Create'
  }
  return 'Modify'
}

function formatActivityDate(timestamp: string): string {
  if (!timestamp) return 'N/A'
  const dateObj = new Date(timestamp)
  if (isNaN(dateObj.getTime())) return 'N/A'

  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' })
  const year = dateObj.getFullYear()
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12

  return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`
}

function formatActorType(actorType: string): string {
  if (!actorType) return 'Admin'
  return actorType.charAt(0).toUpperCase() + actorType.slice(1)
}

function getActivityDescription(action: string, newValues?: Record<string, any>): string {
  const lowerAction = action.toLowerCase()

  // For savings type updates, show the display_name or description
  if (lowerAction.includes('savings_type')) {
    if (newValues?.display_name) {
      return newValues.display_name
    }
    if (newValues?.description) {
      return newValues.description
    }
  }

  // For gift card related actions
  if (lowerAction.includes('gift_card') || lowerAction.includes('card')) {
    if (newValues?.card_type) {
      return `${newValues.card_type} Gift Card`
    }
    if (newValues?.title) {
      return newValues.title
    }
  }

  // Fallback: create a readable description from the action
  return action
    .replace(/_/g, ' ')
    .replace(/ADMIN\s+/i, '')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// Mock data for audit logs
const MOCK_ACTIVITIES: ActivityData[] = [
  {
    id: '1',
    actor_name: 'John Doe',
    actor_type: 'admin',
    action: 'Created DashPro Gift Card',
    new_values: {
      card_type: 'DashPro',
      title: 'DashPro Gift Card',
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    actor_name: 'Sarah Smith',
    actor_type: 'corporate',
    action: 'Modified Payment Method',
    new_values: {
      payment_type: 'Bank Transfer',
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    actor_name: 'Michael Johnson',
    actor_type: 'vendor',
    action: 'Created Branch Location',
    new_values: {
      branch_name: 'Accra Main Branch',
      location: 'Accra, Ghana',
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    actor_name: 'Emily Brown',
    actor_type: 'admin',
    action: 'Added DashX Gift Card',
    new_values: {
      card_type: 'DashX',
      title: 'DashX Gift Card',
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '5',
    actor_name: 'David Wilson',
    actor_type: 'corporate',
    action: 'Updated Business Details',
    new_values: {
      business_name: 'Tech Solutions Ltd',
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '6',
    actor_name: 'Lisa Anderson',
    actor_type: 'vendor',
    action: 'Modified Redemption Settings',
    new_values: {
      setting: 'Auto-approve redemptions',
    },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    id: '7',
    actor_name: 'Robert Taylor',
    actor_type: 'corporate',
    action: 'Created Purchase Request',
    new_values: {
      amount: '5000',
      currency: 'GHS',
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '8',
    actor_name: 'Jessica Martinez',
    actor_type: 'admin',
    action: 'Approved Request',
    new_values: {
      request_id: 'REQ-12345',
    },
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
]

// Table columns for audit logs
const auditLogsColumns = [
  {
    header: 'Actor',
    accessorKey: 'actor',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const actor = activity.actor_name || 'Admin'
      const role = formatActorType(activity.actor_type || 'admin')
      return (
        <div>
          <Text variant="span" className="text-sm text-gray-800">
            {actor}
          </Text>
          <Text variant="span" className="text-xs text-gray-500 ml-1">
            – {role}
          </Text>
        </div>
      )
    },
  },
  {
    header: 'Action',
    accessorKey: 'action',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const actionType = getActionType(activity.action)
      return (
        <Text variant="span" className={cn('text-xs font-medium', actionStyles[actionType])}>
          {actionType}
        </Text>
      )
    },
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const description = getActivityDescription(activity.action, activity.new_values)
      return (
        <Text variant="span" className="text-sm text-gray-600 line-clamp-1">
          {description}
        </Text>
      )
    },
  },
  {
    header: 'Date',
    accessorKey: 'created_at',
    cell: ({ row }: any) => {
      const activity = row.original as ActivityData
      const date = formatActivityDate(activity.created_at)
      return (
        <Text variant="span" className="text-xs text-gray-400">
          {date}
        </Text>
      )
    },
  },
]

const auditLogsCsvHeaders = [
  { name: 'Actor', accessor: 'actor_name' },
  { name: 'Role', accessor: 'actor_type' },
  { name: 'Action', accessor: 'action' },
  { name: 'Date', accessor: 'created_at' },
]

export default function AuditLogs() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

  const { useGetAuditLogsService } = corporate()

  const { data: auditLogs } = useGetAuditLogsService()
  console.log('auditLogs', auditLogs)
  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Audit Logs
          </Text>
        </div>
        <div className="relative space-y-[37px]">
          <div className="text-[#0c4b77] py-2 border-b-2 border-[#0c4b77] w-fit">
            <Text variant="h6" weight="medium">
              All audit logs
            </Text>
          </div>
          <PaginatedTable
            filterWrapperClassName="lg:absolute lg:top-0 lg:right-[2px]"
            columns={auditLogsColumns}
            data={MOCK_ACTIVITIES}
            total={MOCK_ACTIVITIES.length}
            loading={false}
            query={query}
            setQuery={setQuery}
            csvHeaders={auditLogsCsvHeaders}
            printTitle="Audit Logs"
          />
        </div>
      </div>
    </div>
  )
}
