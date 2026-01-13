import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'
import { useUserProfile } from '@/hooks'
import { ROUTES } from '@/utils/constants'
import { Loader } from '@/components'

type ChecklistItem = {
  id: string
  title: string
  description: string
  isComplete: boolean
  route: string
  helper?: string
}

const formatStage = (stage?: string) => {
  if (!stage) return 'Not started'
  return stage
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function Compliance() {
  const navigate = useNavigate()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading, refetch, isFetching } = useGetUserProfileService()

  const checklist = React.useMemo<ChecklistItem[]>(() => {
    const hasProfile =
      Boolean(userProfileData?.fullname) &&
      Boolean(userProfileData?.street_address) &&
      Boolean(userProfileData?.dob) &&
      Boolean(userProfileData?.id_number)

    const hasIdentityDocs = Boolean(userProfileData?.id_images?.length)
    const hasBusinessDetails = Boolean(userProfileData?.business_details?.length)
    const hasBusinessDocs = Boolean(userProfileData?.business_documents?.length)

    return [
      {
        id: 'profile',
        title: 'Profile Information & Identity Documents',
        description:
          'Complete your contact details and upload a government-issued photo ID for verification.',
        helper:
          "Full name, address, date of birth, ID number, and photo ID (Passport, National ID, or Driver's License).",
        isComplete: hasProfile && hasIdentityDocs,
        route: ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.PROFILE_INFORMATION,
      },
      {
        id: 'business',
        title: 'Business Details & Documentation',
        description:
          'Complete your business information and provide proof of incorporation and supporting files.',
        helper:
          'Business name, registration number, address, and documents (Certificate of incorporation, licence, utility bill, logo).',
        isComplete: hasBusinessDetails && hasBusinessDocs,
        route: ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.BUSINESS_DETAILS,
      },
    ]
  }, [userProfileData])

  const totalSteps = checklist.length || 1
  const completedSteps = checklist.filter((item) => item.isComplete).length
  const progress = Math.round((completedSteps / totalSteps) * 100)
  const nextStep = checklist.find((item) => !item.isComplete)
  const onboardingStage = formatStage(userProfileData?.onboarding_stage)
  const status = userProfileData?.status ? formatStage(userProfileData.status) : 'Pending review'

  if (isLoading) {
    return (
      <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="bg-linear-to-br from-[#f9f5ff] via-white to-[#fdf9ff] border border-gray-100 rounded-[32px] shadow-[0_30px_80px_rgba(64,45,135,0.08)] p-6 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#402D87] text-white flex items-center justify-center shadow-lg shadow-[#402D87]/30">
              <Icon icon="bi:shield-check" className="text-3xl" />
            </div>
            <div>
              <p className="uppercase text-xs tracking-[0.3em] text-[#402D87]/70 font-semibold mb-2">
                Vendor Compliance
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#111827]">Complete onboarding</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-2xl">
                Share your compliance information so we can verify your business and activate vendor
                settlements. You can finish every requirement from this page.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  nextStep
                    ? nextStep.route
                    : ROUTES.IN_APP.DASHBOARD.VENDOR.HOME + '?account=vendor',
                )
              }
            >
              {nextStep ? `Continue with ${nextStep.title}` : 'All steps completed'}
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              loading={isFetching}
              className="rounded-full!"
            >
              Refresh status
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Overall progress</p>
            <p className="mt-3 text-4xl font-bold text-[#402D87]">{progress}%</p>
            <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#402D87] via-[#7950ed] to-[#d977ff] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {completedSteps} of {totalSteps} tasks complete
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Onboarding stage</p>
            <p className="mt-3 text-2xl font-semibold text-[#1f2937]">{onboardingStage}</p>
            <p className="mt-2 text-sm text-gray-500">
              We update this automatically once each requirement is approved.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Account status</p>
            <p className="mt-3 text-2xl font-semibold text-[#1f2937]">{status}</p>
            <p className="mt-2 text-sm text-gray-500">
              Last updated{' '}
              {userProfileData?.updated_at
                ? new Date(userProfileData.updated_at).toLocaleDateString()
                : 'recently'}
            </p>
          </div>
        </div>
      </header>

      <section className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(17,24,39,0.05)] p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#111827]">Onboarding checklist</h2>
            <p className="text-sm text-gray-500">
              Complete each requirement to unlock settlements and marketplace visibility.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#059669] bg-[#ecfdf5] border border-[#a7f3d0] px-4 py-2 rounded-full">
            <Icon icon="bi:patch-check-fill" className="text-base" />
            Compliance ready once all steps are green
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="relative rounded-3xl border border-gray-100 p-6 shadow-[0_15px_40px_rgba(15,23,42,0.05)] bg-linear-to-br from-white to-[#f9fbff]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                    item.isComplete ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#fff7ed] text-[#c2410c]'
                  }`}
                >
                  <Icon icon={item.isComplete ? 'bi:check-circle-fill' : 'bi:exclamation-circle'} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Step</p>
                      <h3 className="text-xl font-semibold text-[#111827]">{item.title}</h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.isComplete
                          ? 'bg-[#ecfdf5] text-[#059669]'
                          : 'bg-[#fef2f2] text-[#dc2626]'
                      }`}
                    >
                      {item.isComplete ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                  {item.helper && <p className="mt-1 text-xs text-gray-400">{item.helper}</p>}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant={item.isComplete ? 'outline' : 'secondary'}
                      size="medium"
                      className="rounded-full!"
                      onClick={() => navigate(item.route + '?account=vendor')}
                    >
                      {item.isComplete ? 'Review details' : 'Complete step'}
                    </Button>
                    {item.isComplete && (
                      <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <Icon icon="bi:clock-history" />
                        Updated{' '}
                        {userProfileData?.updated_at
                          ? new Date(userProfileData.updated_at).toLocaleDateString()
                          : 'recently'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
