import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text } from '@/components'
import { cn } from '@/libs'
import { ROUTES } from '@/utils/constants'
import { corporateQueries } from '../../corporate'

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

function getActivityDescription(description: string, action: string): string {
  // Use description if available, otherwise format the action
  if (description) {
    return description.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  // Fallback: create a readable description from the action
  return action
    .replace(/_/g, ' ')
    .replace(/ADMIN\s+/i, '')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const addAccountParam = (path: string): string => {
  const separator = path?.includes('?') ? '&' : '?'
  return `${path}${separator}account=corporate`
}

export default function RecentAuditLogs() {
  const { useGetAuditLogsCorporateService } = corporateQueries()
  const { data: auditLogsResponse, isLoading } = useGetAuditLogsCorporateService()

  const recentActivities = React.useMemo(() => {
    const auditLogs = auditLogsResponse || []
    return auditLogs.slice(0, 4).map((activity: any) => ({
      id: activity.id.toString(),
      actor: activity.name || activity.user_email || 'System',
      role: formatActorType(activity.user_type || 'admin'),
      action: getActionType(activity.action),
      description: getActivityDescription(activity.description, activity.action),
      date: formatActivityDate(activity.created_at),
    }))
  }, [auditLogsResponse])

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
        {isLoading ? (
          <div className="text-center py-10 text-[#6c757d]">
            <Text variant="p" className="text-sm m-0">
              Loading...
            </Text>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-10 text-[#6c757d] flex flex-col items-center justify-center">
            <Icon icon="bi:inbox" className="text-6xl text-[#e9ecef] mb-3" />
            <Text variant="p" className="text-sm text-[#6c757d] m-0">
              No audit logs to display
            </Text>
          </div>
        ) : (
          <div className="divide-y divide-[#F2F4F7]">
            {recentActivities.map((activity: any) => (
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
                  <span
                    className={cn(
                      'font-medium',
                      actionStyles[activity.action as 'Create' | 'Modify'],
                    )}
                  >
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
