import React from 'react'
import { Text } from '@/components'
import { PaginatedTable } from '@/components/Table'
import { cn } from '@/libs'
import { DEFAULT_QUERY } from '@/utils/constants/shared'
import { useReducerSpread } from '@/hooks'

type QueryType = typeof DEFAULT_QUERY

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

// Mock data for vendor audit logs
const MOCK_ACTIVITIES: ActivityData[] = [
  {
    id: '1',
    actor_name: 'Vendor Admin',
    actor_type: 'vendor',
    action: 'Created Branch Location',
    new_values: {
      branch_name: 'Accra Main Branch',
      location: 'Accra, Ghana',
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    actor_name: 'Branch Manager',
    actor_type: 'vendor',
    action: 'Modified Redemption Settings',
    new_values: {
      setting: 'Auto-approve redemptions',
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    actor_name: 'Vendor Admin',
    actor_type: 'vendor',
    action: 'Added New Experience',
    new_values: {
      experience_name: 'ShopRite Gift Card Experience',
    },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: '4',
    actor_name: 'System',
    actor_type: 'system',
    action: 'Updated Payment Method',
    new_values: {
      payment_type: 'Mobile Money',
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: '5',
    actor_name: 'Vendor Admin',
    actor_type: 'vendor',
    action: 'Modified Branch Details',
    new_values: {
      branch_name: 'Kumasi Branch',
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: '6',
    actor_name: 'Branch Manager',
    actor_type: 'vendor',
    action: 'Created Redemption Request',
    new_values: {
      amount: '500',
      currency: 'GHS',
    },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    id: '7',
    actor_name: 'Vendor Admin',
    actor_type: 'vendor',
    action: 'Updated Experience Status',
    new_values: {
      status: 'active',
    },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: '8',
    actor_name: 'System',
    actor_type: 'system',
    action: 'Processed Redemption',
    new_values: {
      transaction_id: 'TXN-12345',
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
  { label: 'Actor', key: 'actor_name' },
  { label: 'Role', key: 'actor_type' },
  { label: 'Action', key: 'action' },
  { label: 'Date', key: 'created_at' },
]

export default function AuditLogs() {
  const [query, setQuery] = useReducerSpread<QueryType>(DEFAULT_QUERY)

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
