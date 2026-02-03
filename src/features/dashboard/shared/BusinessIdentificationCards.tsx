import { Link } from 'react-router-dom'

import { ROUTES } from '@/utils/constants'
import { BusinessUploadIDForm } from '@/features/dashboard/components'
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components'

export default function BusinessIdentificationCards() {
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
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <BusinessUploadIDForm />
      </div>
    </section>
  )
}
