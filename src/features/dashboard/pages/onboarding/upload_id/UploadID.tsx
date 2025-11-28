import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { UserUploadIDForm } from '../../../../auth/components'
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

export default function UploadID() {
  const { data: userProfile } = useUserProfile()

  // Only check for identity documents completion
  const hasIdentityDocs = Boolean(userProfile?.id_images?.length)
  const progress = hasIdentityDocs ? 100 : 0

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
              <BreadcrumbPage>Upload ID</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold">Profile Information</h1>
      </div>
      <Banner currentProgress={progress} />
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <UserUploadIDForm />
      </div>
    </section>
  )
}
