import { TabbedView, Text } from '@/components'
import { InviteAdmin } from '../../../components/corporate/modals/InviteAdmin'
import { useCorporateAdmins } from '@/features/dashboard/hooks'

export default function CorporateAdmins() {
  const { corporateAdminTabConfigs } = useCorporateAdmins()

  return (
    <>
      <div className="py-10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Text variant="h2" weight="semibold" className="text-primary-900">
              Admins
            </Text>
            <InviteAdmin />
          </div>

          <TabbedView
            tabs={corporateAdminTabConfigs}
            defaultTab="all-admins"
            urlParam="tab"
            containerClassName="space-y-4"
            btnClassName="pb-2"
            tabsClassName="gap-6"
          />
        </div>
      </div>
    </>
  )
}
