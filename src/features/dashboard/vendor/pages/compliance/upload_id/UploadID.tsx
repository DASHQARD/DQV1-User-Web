import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { UserUploadIDForm } from '@/features/auth/components'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components'

export default function UploadID() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={ROUTES.IN_APP.DASHBOARD.VENDOR.COMPLIANCE.ROOT + '?account=vendor'}>
                  Compliance
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Upload ID</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Upload ID</h1>
      </div>

      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <UserUploadIDForm />
      </div>
    </section>
  )
}
