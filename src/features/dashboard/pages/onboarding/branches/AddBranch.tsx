import { Link, useNavigate } from 'react-router-dom'
import { AddBranchForm } from '@/features/dashboard/components'
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
} from '@/components'
import { Icon } from '@/libs'
import { useAuth } from '@/features/auth/hooks'
import { useToast } from '@/hooks'
import React from 'react'

export default function AddBranch() {
  const navigate = useNavigate()
  const toast = useToast()
  const { useUploadBranchesService } = useAuth()
  const { mutateAsync: uploadBranches, isPending: isUploading } = useUploadBranchesService()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

    try {
      await uploadBranches(file)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // Optionally navigate or refresh the page
      navigate(ROUTES.IN_APP.DASHBOARD.COMPLIANCE.ROOT)
    } catch (error) {
      console.error('Failed to upload branches:', error)
      // Error is already handled by the hook's onError
    }
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
              <Button className="w-fit !bg-black !text-white !rounded-none" size="small">
                <Icon icon="bi:plus" className="size-6" />
                Add Branch
              </Button>
              <Button
                variant="outline"
                className="w-fit !rounded-none"
                size="small"
                onClick={handleImportClick}
                disabled={isUploading}
                loading={isUploading}
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

      <div className="bg-white border border-[#CDD3D3] rounded-xl p-8">
        <AddBranchForm />
      </div>
    </section>
  )
}
