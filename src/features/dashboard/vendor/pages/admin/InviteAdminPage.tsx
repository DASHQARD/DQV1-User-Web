import { Text } from '@/components'
import { InviteAdmin } from '../invite/InviteAdmin'

export default function InviteAdminPage() {
  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <Text variant="h3" weight="semibold" className="text-gray-900">
            Invite Admin
          </Text>
          <Text variant="span" className="text-gray-500 text-sm">
            Send an invitation to a new admin. They will receive an email with instructions to set
            up their account.
          </Text>
        </div>

        <InviteAdmin />
      </div>
    </div>
  )
}
