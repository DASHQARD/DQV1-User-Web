// import { useMemo } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Icon } from '@/libs'
// import { Button } from '@/components/Button'
// import { useUserProfile } from '@/hooks'
// import { ROUTES } from '@/utils/constants'
// import { Loader } from '@/components'

// type ChecklistItem = {
//   id: string
//   title: string
//   description: string
//   isComplete: boolean
//   route: string
//   helper?: string
// }

// const formatStage = (stage?: string) => {
//   if (!stage) return 'Not started'
//   return stage
//     .split('_')
//     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//     .join(' ')
// }

export default function Compliance() {
  // const navigate = useNavigate()
  // const { data: userProfile, isLoading, refetch, isFetching } = useUserProfile()

  // const checklist = useMemo<ChecklistItem[]>(() => {
  //   const hasProfile =
  //     Boolean(userProfile?.fullname) &&
  //     Boolean(userProfile?.street_address) &&
  //     Boolean(userProfile?.dob) &&
  //     Boolean(userProfile?.id_number)

  //   const hasIdentityDocs = Boolean(userProfile?.id_images?.length)
  //   const hasBusinessDetails = Boolean(userProfile?.business_details?.length)
  //   const hasBusinessDocs = Boolean(userProfile?.business_documents?.length)
  //   const hasPaymentDetails =
  //     Boolean(userProfile?.momo_accounts?.length) || Boolean(userProfile?.bank_accounts?.length)

  //   const userType = (userProfile as any)?.user_type
  //   const isCorporate = userType === 'corporate'

  //   const baseChecklist: ChecklistItem[] = [
  //     {
  //       id: 'profile',
  //       title: 'Profile Information & Identity Documents',
  //       description:
  //         'Complete your contact details and upload a government-issued photo ID for verification.',
  //       helper:
  //         "Full name, address, date of birth, ID number, and photo ID (Passport, National ID, or Driver's License).",
  //       isComplete: hasProfile && hasIdentityDocs,
  //       route: ROUTES.IN_APP.DASHBOARD.COMPLIANCE.PROFILE_INFORMATION,
  //     },
  //     {
  //       id: 'business',
  //       title: 'Business Details & Documentation',
  //       description:
  //         'Complete your business information and provide proof of incorporation and supporting files.',
  //       helper:
  //         'Business name, registration number, address, and documents (Certificate of incorporation, licence, utility bill, logo).',
  //       isComplete: hasBusinessDetails && hasBusinessDocs,
  //       route: ROUTES.IN_APP.DASHBOARD.COMPLIANCE.BUSINESS_DETAILS,
  //     },
  //   ]

  //   if (isCorporate) {
  //     return baseChecklist
  //   }

  //   return [
  //     ...baseChecklist,
  //     {
  //       id: 'payout',
  //       title: 'Payout Method',
  //       description: 'Select how you want to receive settlements.',
  //       helper: 'Mobile money or bank account for payouts.',
  //       isComplete: hasPaymentDetails,
  //       route: ROUTES.IN_APP.DASHBOARD.PAYMENT_METHODS,
  //     },
  //   ]
  // }, [userProfile])

  // const totalSteps = checklist.length || 1
  // const completedSteps = checklist.filter((item) => item.isComplete).length
  // const progress = Math.round((completedSteps / totalSteps) * 100)
  // const nextStep = checklist.find((item) => !item.isComplete)
  // const onboardingStage = formatStage(userProfile?.onboarding_stage)
  // const status = userProfile?.status ? formatStage(userProfile.status) : 'Pending review'
  // const userType = (userProfile as any)?.user_type
  // const isCorporate = userType === 'corporate'

  // if (isLoading) {
  //   return (
  //     <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
  //       <Loader />
  //     </div>
  //   )
  // }

  return (
    <>Compliance</>
    // <div className="space-y-8">
    //   <header className="bg-linear-to-br from-[#f9f5ff] via-white to-[#fdf9ff] border border-gray-100 rounded-[32px] shadow-[0_30px_80px_rgba(64,45,135,0.08)] p-6 sm:p-10">
    //     ...
    //   </header>
    //   ...
    // </div>
  )
}
