import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  Banner,
} from '@/components'
import { OnboardingForm } from '@/features/auth'
import { ROUTES } from '@/utils/constants'
import { Link } from 'react-router-dom'
import { useUserProfile } from '@/hooks'

export default function ProfileInformation() {
  const { data: userProfile } = useUserProfile()

  // Only check for profile information completion
  const hasProfile =
    Boolean(userProfile?.fullname) &&
    Boolean(userProfile?.street_address) &&
    Boolean(userProfile?.dob) &&
    Boolean(userProfile?.id_number)
  const progress = hasProfile ? 100 : 0

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT}>Compliance</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile Information</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Profile Information</h1>
      </div>
      <Banner currentProgress={progress} />
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <OnboardingForm />
      </div>
    </section>
  )
}
