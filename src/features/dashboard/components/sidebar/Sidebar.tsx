import React from 'react'
import { Icon } from '@/libs'
import { cn } from '@/libs'
import { Text, Avatar } from '@/components'

interface BaseSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  accountLabel: string
  accountMenuContent?: React.ReactNode
  children: React.ReactNode
}

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  accountLabel,
  accountMenuContent,
  children,
}: BaseSidebarProps) {
  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col h-screen transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar size="sm" />
            <Text variant="span" weight="semibold" className="text-sm truncate">
              {accountLabel}
            </Text>
          </div>
        )}
        {isCollapsed && accountMenuContent && (
          <div className="flex items-center justify-center w-full">{accountMenuContent}</div>
        )}
        {!isCollapsed && accountMenuContent && (
          <div className="flex items-center gap-2">{accountMenuContent}</div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'p-1.5 rounded-md hover:bg-gray-100 transition-colors',
            isCollapsed && 'mx-auto',
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            icon={isCollapsed ? 'bi:chevron-right' : 'bi:chevron-left'}
            className="w-4 h-4 text-gray-600"
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul className="py-2 px-3">{children}</ul>
      </nav>
    </aside>
  )
}
