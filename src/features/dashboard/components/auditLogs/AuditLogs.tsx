import React from 'react'
import { useNavigate } from 'react-router'

import { Loader, Text } from '@/components'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'

type ActivityData = {
  id: string
  actor_name?: string
  actor_type?: string
  action: string
  new_values?: Record<string, any>
  created_at: string
}

type Activity = {
  id: string
  actor: string
  role: string
  action: 'Create' | 'Modify'
  description: string
  date: string
}

const actionStyles: Record<Activity['action'], string> = {
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
]

export default function AuditLogs() {
  const navigate = useNavigate()
  const [isLoading] = React.useState(false)

  const mappedActivities: Activity[] = React.useMemo(() => {
    // Use mock data
    const activities = MOCK_ACTIVITIES

    if (!activities || activities.length === 0) return []

    return activities.slice(0, 6).map((activity) => ({
      id: activity.id,
      actor: activity.actor_name || 'Admin',
      role: formatActorType(activity.actor_type || 'admin'),
      action: getActionType(activity.action),
      description: getActivityDescription(activity.action, activity.new_values),
      date: formatActivityDate(activity.created_at),
    }))
  }, [])

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-[#EEEEF1] bg-white p-6">
      <div className="flex items-center justify-between">
        <Text variant="h6" weight="semibold" className="text-[#0A0D14]">
          Recent activity
        </Text>
        <button
          onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.TRANSACTIONS)}
          className="text-sm text-blue-500 hover:underline"
        >
          View all
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader />
        </div>
      ) : mappedActivities.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">No recent activities</div>
      ) : (
        <div className="divide-y divide-[#F2F4F7]">
          {mappedActivities.map((activity) => (
            <article
              key={activity.id}
              className="flex flex-wrap items-center gap-1 py-4 text-sm text-[#475467] md:flex-nowrap"
            >
              <div className="flex-1 text-nowrap">
                <p className="text-gray-800 text-xs">
                  {activity.actor} <span className="text-[#475467]">– {activity.role}</span>
                </p>
              </div>

              <div className="text-xs mx-2">
                <span className={cn('font-medium', actionStyles[activity.action])}>
                  {activity.action}
                </span>
              </div>

              <div className="flex-1 text-nowrap line-clamp-1 text-gray-400 text-xs">
                {activity.description}
              </div>

              <div className="min-w-[140px] text-gray-400 text-right text-xs">{activity.date}</div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
