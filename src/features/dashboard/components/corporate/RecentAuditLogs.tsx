import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
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

  if (lowerAction.includes('savings_type')) {
    if (newValues?.display_name) {
      return newValues.display_name
    }
    if (newValues?.description) {
      return newValues.description
    }
  }

  if (lowerAction.includes('gift_card') || lowerAction.includes('card')) {
    if (newValues?.card_type) {
      return `${newValues.card_type} Gift Card`
    }
    if (newValues?.title) {
      return newValues.title
    }
  }

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
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    actor_name: 'Sarah Smith',
    actor_type: 'corporate',
    action: 'Modified Payment Method',
    new_values: {
      payment_type: 'Bank Transfer',
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
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
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    actor_name: 'David Wilson',
    actor_type: 'corporate',
    action: 'Updated Business Details',
    new_values: {
      business_name: 'Tech Solutions Ltd',
    },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    actor_name: 'Lisa Anderson',
    actor_type: 'vendor',
    action: 'Modified Redemption Settings',
    new_values: {
      setting: 'Auto-approve redemptions',
    },
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const addAccountParam = (path: string): string => {
  const separator = path?.includes('?') ? '&' : '?'
  return `${path}${separator}account=corporate`
}

export default function RecentAuditLogs() {
  const recentActivities = React.useMemo(() => {
    return MOCK_ACTIVITIES.slice(0, 4).map((activity) => ({
      id: activity.id,
      actor: activity.actor_name || 'Admin',
      role: formatActorType(activity.actor_type || 'admin'),
      action: getActionType(activity.action),
      description: getActivityDescription(activity.action, activity.new_values),
      date: formatActivityDate(activity.created_at),
    }))
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] overflow-hidden">
      <div className="p-6 pb-0 flex justify-between items-center mb-5">
        <h5 className="text-lg font-semibold text-[#495057] m-0 flex items-center">
          <Icon icon="bi:journal-text" className="text-[#402D87] mr-2" />
          Audit Logs
        </h5>
        <Link
          to={addAccountParam(ROUTES.IN_APP.DASHBOARD.CORPORATE.AUDIT_LOGS)}
          className="text-[#402D87] no-underline text-sm font-medium flex items-center transition-colors duration-200 hover:text-[#2d1a72]"
        >
          View all <Icon icon="bi:arrow-right" className="ml-1" />
        </Link>
      </div>

      <div className="px-6 pb-6">
        {recentActivities.length === 0 ? (
          <div className="text-center py-10 text-[#6c757d]">
            <Icon icon="bi:inbox" className="text-5xl text-[#e9ecef] mb-4" />
            <p className="m-0 text-sm">No audit logs to display</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F4F7]">
            {recentActivities.map((activity) => (
              <article
                key={activity.id}
                className="flex flex-wrap items-center gap-2 py-4 text-sm text-[#475467] md:flex-nowrap"
              >
                <div className="flex-1 text-nowrap min-w-[150px]">
                  <p className="text-gray-800 text-xs m-0">
                    {activity.actor} <span className="text-[#475467]">– {activity.role}</span>
                  </p>
                </div>

                <div className="text-xs">
                  <span className={cn('font-medium', actionStyles[activity.action])}>
                    {activity.action}
                  </span>
                </div>

                <div className="flex-1 text-nowrap line-clamp-1 text-gray-400 text-xs min-w-[150px]">
                  {activity.description}
                </div>

                <div className="min-w-[140px] text-gray-400 text-right text-xs">
                  {activity.date}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
