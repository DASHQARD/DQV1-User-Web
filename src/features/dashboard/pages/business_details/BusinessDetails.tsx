import { Link } from 'react-router-dom'

import { BusinessDetailsForm } from '@/features/dashboard/components'
import { ROUTES } from '@/utils/constants'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Banner,
} from '@/components'
import { useUserProfile } from '@/hooks'

export default function BusinessDetails() {
  const { data: userProfile } = useUserProfile()

  // Only check for business details completion
  const hasBusinessDetails = Boolean(userProfile?.business_details?.length)
  const progress = hasBusinessDetails ? 100 : 0

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
              <BreadcrumbPage>Business Details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Business Details</h1>
      </div>
      <Banner currentProgress={progress} />
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <BusinessDetailsForm />
      </div>
    </section>
  )
}
