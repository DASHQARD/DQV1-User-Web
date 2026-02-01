import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Text } from '@/components'
import { CreateBranchForm } from '@/features/dashboard/components/corporate/forms'
import { useUserProfile } from '@/hooks'

export default function CreateBranch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()

  useEffect(() => {
    const vendorIdInUrl = searchParams.get('vendor_id')
    const vendorIdFromProfile =
      userProfileData?.vendor_id != null ? String(userProfileData.vendor_id) : null
    if (vendorIdFromProfile && !vendorIdInUrl) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('vendor_id', vendorIdFromProfile)
          return next
        },
        { replace: true },
      )
    }
  }, [userProfileData?.vendor_id, searchParams, setSearchParams])

  return (
    <div className="lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Create Branch
          </Text>
        </div>

        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#f1f3f4] p-6">
          <div className="mb-6">
            <Text variant="h3" weight="semibold" className="text-gray-900 mb-2">
              Add New Branch
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
      </div>
    </div>
  )
}
