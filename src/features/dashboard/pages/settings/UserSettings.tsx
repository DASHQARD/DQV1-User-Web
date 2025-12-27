import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Icon } from '@/libs'
import { Text, TabbedView } from '@/components'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs/clsx'
import { ChangePasswordSettings } from './ChangePasswordSettings'
import { PersonalInformationSettings } from './PersonalInformationSettings'
import { useEffect } from 'react'

export default function UserSettings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logout } = useAuthStore()

  // Handle path-based routing (e.g., /dashboard/settings/personal-information)
  useEffect(() => {
    if (location.pathname === ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION) {
      // If we're on the personal-information path but no tab param, set it
      if (!searchParams.get('tab')) {
        setSearchParams({ tab: 'personal-information' })
      }
    }
  }, [location.pathname, searchParams, setSearchParams])

  const ACCOUNT_SETTINGS = [
    {
      label: 'Change Password',
      icon: 'bi:lock',
      path: ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT,
    },
    {
      label: 'Personal Information',
      icon: 'bi:person',
      path: ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION,
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
    const currentTab = searchParams.get('tab')
    if (path === ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT) {
      // Root settings is active if no tab is selected or tab is change-password
      return location.pathname === path && (!currentTab || currentTab === 'change-password')
    }
    if (path === ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION) {
      // Personal information is active if path matches or tab is personal-information
      return (
        location.pathname === path ||
        (location.pathname === ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT &&
          currentTab === 'personal-information')
      )
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const settingsTabs = [
    {
      key: 'change-password' as const,
      component: () => <ChangePasswordSettings />,
      label: 'Change Password',
    },
    {
      key: 'personal-information' as const,
      component: () => <PersonalInformationSettings />,
      label: 'Personal Information',
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
                } else if (setting.path === ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION) {
                  // Navigate to settings with tab parameter
                  navigate(`${ROUTES.IN_APP.DASHBOARD.SETTINGS.ROOT}?tab=personal-information`)
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
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Settings
            </Text>
            <Text variant="span" className="text-gray-600 text-sm">
              Manage your account settings and preferences
            </Text>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <TabbedView
              tabs={settingsTabs}
              defaultTab="change-password"
              urlParam="tab"
              containerClassName="p-6"
              btnClassName="pb-3"
              tabsClassName="gap-6 border-b border-gray-200"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
