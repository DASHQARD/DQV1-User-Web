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
  Banner,
} from '@/components'
import { useUserProfile } from '@/hooks'

export default function AddBranch() {
  const { data: userProfile } = useUserProfile()

  // Only check for branch completion
  const branchesData = userProfile?.branches
  const branchCount = Array.isArray(branchesData) ? branchesData.length : 0
  const hasBranches = branchCount > 0
  const progress = hasBranches ? 100 : 0

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
              <BreadcrumbPage>Add Branch</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Add Branch</h1>
      </div>
      <Banner currentProgress={progress} />
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <AddBranchForm />
      </div>
    </section>
  )
}
