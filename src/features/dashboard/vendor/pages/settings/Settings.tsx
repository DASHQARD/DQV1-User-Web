import { Text } from '@/components'

import { TabbedView } from '@/components'
import { BusinessDetailsSettings } from './BusinessDetailsSettings'
import { BusinessLogoSettings } from './BusinessLogoSettings'
// import { PaymentDetailsSettings } from './PaymentDetailsSettings'

export default function Settings() {
  const settingsTabs = [
    {
      key: 'business-details' as const,
      component: () => <BusinessDetailsSettings />,
      label: 'Business Details',
    },
    {
      key: 'business-logo' as const,
      component: () => <BusinessLogoSettings />,
      label: 'Business Logo',
    },
    // {
    //   key: 'payment-details' as const,
    //   component: () => <PaymentDetailsSettings />,
    //   label: 'Payment Details',
    // },
  ]

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Settings
            </Text>
            <Text variant="span" className="text-gray-600 text-sm">
              Manage your business information and payment methods
            </Text>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
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
    </div>
  )
}
