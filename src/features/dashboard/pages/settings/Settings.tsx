import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, TabbedView } from '@/components'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs/clsx'
import { BusinessDetailsSettings } from './BusinessDetailsSettings'

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuthStore()

  const ACCOUNT_SETTINGS = [
    {
      label: 'Business Details',
      icon: 'bi:building',
      path: ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT,
    },
    {
      label: 'Log Out',
      icon: 'bi:box-arrow-right',
      path: ROUTES.IN_APP.AUTH.LOGIN,
      onClick: () => {
        logout()
        navigate(ROUTES.IN_APP.AUTH.LOGIN)
      },
    },
  ]

  const isActive = (path: string) => {
    if (path === ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT) {
      return (
        location.pathname === path ||
        location.pathname === ROUTES.IN_APP.DASHBOARD.CORPORATE.SETTINGS
      )
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const settingsTabs = [
    {
      key: 'business-details' as const,
      component: () => <BusinessDetailsSettings />,
      label: 'Business Details',
    },
  ]

  return (
    <div className="min-h-[600px] bg-gray-50 rounded-xl overflow-hidden flex max-h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-2 min-w-[240px] p-4 bg-white shrink-0 border-r border-gray-200">
        <div className="mb-4">
          <Text variant="h3" weight="semibold" className="text-[#402D87]">
            Settings
          </Text>
          <Text variant="span" className="text-sm text-gray-600">
            Manage your account
          </Text>
        </div>
        {ACCOUNT_SETTINGS.map((setting) => {
          const active = isActive(setting.path)
          return (
            <button
              key={setting.label}
              onClick={() => {
                if (setting.onClick) {
                  setting.onClick()
                } else if (setting.path === ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT) {
                  navigate(ROUTES.IN_APP.DASHBOARD.CORPORATE.SETTINGS)
                } else {
                  navigate(setting.path)
                }
              }}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left w-full',
                'hover:bg-gray-50',
                active
                  ? 'bg-[rgba(64,45,135,0.08)] border-l-[3px] border-[#402D87] text-[#402D87] font-medium shadow-sm'
                  : 'text-gray-700 hover:text-gray-900',
              )}
            >
              <Icon
                icon={setting.icon}
                className={cn('text-lg', active ? 'text-[#402D87]' : 'text-gray-500')}
              />
              <Text variant="span" weight={active ? 'semibold' : 'normal'} className="text-sm">
                {setting.label}
              </Text>
            </button>
          )
        })}
      </div>

      <div className="bg-white flex flex-col flex-1 overflow-y-auto">
        <TabbedView
          tabs={settingsTabs}
          defaultTab="business-details"
          urlParam="tab"
          containerClassName="p-6"
          btnClassName="pb-3"
          tabsClassName="gap-6 border-b border-gray-200"
        />
      </div>
    </div>
  )
}
