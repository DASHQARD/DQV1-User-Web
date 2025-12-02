import { Link } from 'react-router-dom'
import { AddBranchForm } from '@/features/dashboard/components'
import { ROUTES } from '@/utils/constants'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components'

export default function CreateBranch() {
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
              <BreadcrumbLink asChild>
                <Link to={ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ADD_BRANCH}>Branches</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Create Branch</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Create Branch</h1>
      </div>

      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <AddBranchForm />
      </div>
    </section>
  )
}

