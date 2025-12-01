import { Link } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'
import { BusinessUploadIDForm } from '@/features/dashboard/components'
import { Banner } from '@/components/Banner'
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components'
import { useUserProfile } from '@/hooks'

export default function BusinessIdentificationCards() {
  const { data: userProfile } = useUserProfile()

  // Only check for business documents completion
  const hasBusinessDocs = Boolean(userProfile?.business_documents?.length)
  const progress = hasBusinessDocs ? 100 : 0

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
              <BreadcrumbPage>Business Identification Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Business Identification Documents</h1>
      </div>
      <Banner currentProgress={progress} />
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <BusinessUploadIDForm />
      </div>
    </section>
  )
}
