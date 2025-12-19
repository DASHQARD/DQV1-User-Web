import { useLocation } from 'react-router-dom'
import { Text, TabbedView } from '@/components'
import { InviteBranchManager } from './InviteBranchManager'
import { InviteAdmin } from './InviteAdmin'

export default function Invite() {
  const location = useLocation()

  // Determine default tab based on current route
  const defaultTab = location.pathname.includes('invite-admin') ? 'admin' : 'branch-manager'

  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Branches & Admin
          </Text>
        </div>

        <TabbedView
          tabs={[
            {
              key: 'branch-manager',
              label: 'Create Branch',
              component: InviteBranchManager,
            },
            {
              key: 'admin',
              label: 'Invite Admin',
              component: InviteAdmin,
            },
          ]}
          defaultTab={defaultTab}
          containerClassName="space-y-6"
        />
      </div>
    </div>
  )
}
