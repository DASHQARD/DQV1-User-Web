import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
  Text,
  Button,
  Loader,
} from '@/components'
import { Icon } from '@/libs'
import { useToast, useUserProfile } from '@/hooks'
import React from 'react'
// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { bulkUploadBranches } from '@/features/dashboard/services/vendor/branches'

export default function AddBranch() {
  const navigate = useNavigate()
  const toast = useToast()
  // const queryClient = useQueryClient()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData, isLoading } = useGetUserProfileService()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // const bulkUploadMutation = useMutation({
  //   mutationFn: bulkUploadBranches,
  //   onSuccess: (response: any) => {
  //     const message =
  //       response.data?.successful && response.data?.total
  //         ? `Successfully uploaded ${response.data.successful} of ${response.data.total} branches`
  //         : 'Branches uploaded successfully'
  //     toast.success(message)
  //     queryClient.invalidateQueries({ queryKey: ['branches'] })
  //     refetch()
  //     navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
  //   },
  //   onError: (error: any) => {
  //     toast.error(error?.message || 'Failed to upload branches. Please try again.')
  //   },
  // })

  // Check if user has any branches (main branch exists)
  const hasBranches =
    Array.isArray(userProfileData?.branches) && userProfileData?.branches?.length > 0

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validExtensions = ['.xlsx', '.xls']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Please upload an Excel file (.xlsx or .xls)')
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // bulkUploadMutation.mutate(file)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    )
  }

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

      <div className="border border-[#DEDEDE]">
        <div className="py-2 px-4 border-b border-b-[#DEDEDE]">
          <div className="py-1 px-3 bg-[#B5B5B5]/20 text-sm font-medium text-[#B5B5B5] w-fit">
            All Branches
          </div>
        </div>
        <section className="py-20 px-8 bg-white">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h4 className="text-lg font-semibold text-gray-900">Add your branch details here</h4>
              <Text variant="span" className="">
                Start by adding your main branch details
              </Text>
            </div>
            <div className="flex gap-2">
              <Button
                className="w-fit !bg-black !text-white !rounded-none"
                size="small"
                onClick={() => navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.CREATE_BRANCH)}
              >
                <Icon icon="bi:plus" className="size-6" />
                Add Branch
              </Button>
              <Button
                variant="outline"
                className="w-fit !rounded-none"
                size="small"
                onClick={handleImportClick}
                // disabled={bulkUploadMutation.isPending || !hasBranches}
                // loading={bulkUploadMutation.isPending}
                title={
                  !hasBranches ? 'Please add a main branch first' : 'Import branches from Excel'
                }
              >
                <Icon icon="bi:plus" className="size-6" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </section>
        <div></div>
      </div>

      {/* Add Main Branch Form */}
      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add Main Branch</h3>
          <Text variant="span" className="text-gray-600">
            {!hasBranches
              ? 'You need to add a main branch before you can import additional branches or add more branches manually.'
              : 'Update your main branch details or add additional branches.'}
          </Text>
        </div>
      </div>
    </section>
  )
}
