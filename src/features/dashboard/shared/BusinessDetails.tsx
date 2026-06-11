import { useEffect } from 'react'
import { BusinessDetailsForm } from '@/features/dashboard/components'

import { Icon } from '@/libs'
import { Loader, Text } from '@/components'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { isCorporateBusinessDetailsSubmitted } from '@/features/dashboard/corporate/utils/corporateNavAccess'

export default function BusinessDetails() {
  const navigate = useNavigate()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading } = useGetUserProfileService()

  const isSubmitted = isCorporateBusinessDetailsSubmitted(userProfileData?.onboarding_progress)

  useEffect(() => {
    if (!isLoading && isSubmitted) {
      navigate(`${ROUTES.IN_APP.DASHBOARD.CORPORATE.HOME}?account=corporate`, { replace: true })
    }
  }, [isLoading, isSubmitted, navigate])

  if (isLoading || isSubmitted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader />
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-start gap-3 flex-col">
        <button
          className="flex gap-1 items-center text-[10px] text-[#95aac9]"
          onClick={() => navigate(-1)}
        >
          <Icon icon="bi:arrow-left-short" className="text-lg" />
          <Text variant="span" weight="medium">
            Settings
          </Text>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl">
        <BusinessDetailsForm />
      </div>
    </section>
  )
}
