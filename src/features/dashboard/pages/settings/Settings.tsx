import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@/libs'
import { Loader, Text } from '@/components'
import { useAuthStore } from '@/stores'
import { ROUTES } from '@/utils/constants'
import { cn } from '@/libs/clsx'
import { useUserProfile } from '@/hooks'
import { UpdateUserInfoSchema } from '@/utils/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export default function Settings() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: userProfile } = useUserProfile()
  const { logout } = useAuthStore()

  console.log('userProfile', userProfile)

  const form = useForm<z.infer<typeof UpdateUserInfoSchema>>({
    resolver: zodResolver(UpdateUserInfoSchema),
  })
  const [isLoading] = useState(false)

  // Update profile when user info changes
  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        fullname: userProfile?.fullname || '',
        dob: userProfile?.dob || '',
      })
    }
  }, [userProfile, form])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-xl">
        <Loader />
      </div>
    )
  }

  const ACCOUNT_SETTINGS = [
    {
      label: 'Account',
      icon: 'bi:person-badge',
      path: ROUTES.IN_APP.DASHBOARD.SETTINGS.PERSONAL_INFORMATION,
    },
    {
      label: 'Security Settings',
      icon: 'bi:shield-lock',
      path: ROUTES.IN_APP.DASHBOARD.SETTINGS.SECURITY_SETTINGS,
    },
    {
      label: 'Payout Accounts',
      icon: 'bi:credit-card-fill',
      path: ROUTES.IN_APP.DASHBOARD.VENDOR.PAYMENT_METHODS,
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
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-[600px] bg-gray-50 rounded-xl overflow-hidden flex max-h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-2 min-w-[240px] p-4 bg-white shrink-0">
        {ACCOUNT_SETTINGS.map((setting) => {
          const active = isActive(setting.path)
          return (
            <button
              key={setting.label}
              onClick={() => navigate(setting.path)}
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

      <div className="bg-white flex flex-col px-4 sm:px-8 py-10 overflow-y-auto flex-1">
        {/* Header Section */}

        {/* Settings Section */}
        <div className="flex-1">
          {/* Personal Details Section */}
          <div className="flex flex-col gap-6 max-w-[607px] w-full border border-[#e5e7eb] py-5 px-[30px] rounded-xl">
            <Text variant="h2" weight="semibold">
              Account Information
            </Text>

            <div className="flex flex-col gap-8">
              <div>
                <Text variant="p" weight="semibold">
                  Email
                </Text>
                <Text variant="span" className="text-[#14171f]">
                  {userProfile?.email}
                </Text>
              </div>

              <div>
                <Text variant="p" weight="semibold">
                  Birthdate
                </Text>
                <Text variant="span" className="text-[#14171f]">
                  {userProfile?.dob ? userProfile?.dob : 'MM/YYYY/DD'}
                </Text>
              </div>

              <hr className="border-[#e5e7eb]" />

              <div>
                <Text variant="h2" weight="semibold">
                  Personal Information
                </Text>
                <Text variant="span" className="text-[#4a5264]">
                  This information will appear on all future invoices
                </Text>
              </div>

              <div>
                <Text variant="p" weight="semibold">
                  Your address
                </Text>
                <Text variant="span" className="text-[#14171f]">
                  {userProfile?.street_address
                    ? userProfile?.street_address
                    : 'No address provided'}
                </Text>
              </div>

              <div>
                <Text variant="p" weight="semibold">
                  Your phone number
                </Text>
                <Text variant="span" className="text-[#14171f]">
                  {userProfile?.phonenumber ? userProfile?.phonenumber : 'No phone number provided'}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
