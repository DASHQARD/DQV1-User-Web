import { Text } from '@/components'
import { CreateBranchForm } from '@/features/dashboard/components/corporate/forms'

export function InviteBranchManager() {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] p-6">
      <div className="mb-6">
        <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
          Create Branch
        </Text>
        <Text variant="span" className="text-gray-500 text-sm">
          Add a new branch to your vendor account. Fill in the branch details and manager
          information.
        </Text>
      </div>

      <div className="max-w-[600px]">
        <CreateBranchForm />
      </div>
    </div>
  )
}
