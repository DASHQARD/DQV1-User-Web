import { Text } from '@/components'
import { InviteAdmin } from '../invite/InviteAdmin'

export default function InviteAdminPage() {
  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Invite Admin
          </Text>
        </div>

        <InviteAdmin />
      </div>
    </div>
  )
}
