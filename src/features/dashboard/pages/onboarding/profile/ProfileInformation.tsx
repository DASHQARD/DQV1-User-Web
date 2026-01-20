import { OnboardingForm } from '@/features/auth'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components'

export default function ProfileInformation() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-[#CDD3D3] pb-4">
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
      </div>

      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <OnboardingForm />
      </div>
    </section>
  )
}
