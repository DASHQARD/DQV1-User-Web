import React from 'react'
// import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button, FileUploader, Modal, Text } from '@/components'
import { usePersistedModalState } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
// import { bulkUploadBranches } from '@/features/dashboard/services/vendor'

export function BulkUploadBranches() {
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH.BULK_UPLOAD,
  })

  return (
    <>
      <Button
        variant="outline"
        className="cursor-pointer"
        size={'medium'}
        onClick={() => modal.openModal(MODALS.BRANCH.BULK_UPLOAD)}
      >
        <Icon icon="hugeicons:upload-01" className="mr-2" />
        Bulk Upload
      </Button>
      <BulkUploadModal modal={modal} />
    </>
  )
}

function BulkUploadModal({ modal }: { modal: ReturnType<typeof usePersistedModalState> }) {
  const [bulkFile, setBulkFile] = React.useState<File | null>(null)
  // const queryClient = useQueryClient()
  // const toast = useToast()

  // const bulkUploadMutation = useMutation({
  //   mutationFn: bulkUploadBranches,
  //   onSuccess: (response) => {
  //     const message =
  //       response.data?.successful && response.data?.total
  //         ? `Successfully uploaded ${response.data.successful} of ${response.data.total} branches`
  //         : 'Branches uploaded successfully'
  //     toast.success(message)
  //     queryClient.invalidateQueries({ queryKey: ['branches'] })
  //     setBulkFile(null)
  //     modal.closeModal()
  //   },
  //   onError: (error: any) => {
  //     toast.error(error?.message || 'Failed to upload branches. Please try again.')
  //   },
  // })

  // const handleBulkUpload = () => {
  //   if (!bulkFile) return
  //   bulkUploadMutation.mutate(bulkFile)
  // }

  const handleClose = () => {
    setBulkFile(null)
    modal.closeModal()
  }

  // Example CSV content for bulk branch upload
  const exampleCSV = `branch_name,branch_location,branch_manager_name,branch_manager_email,phone_number
Main Branch,Accra Central,John Doe,john.doe@example.com,+233551234567
North Branch,Accra North,Jane Smith,jane.smith@example.com,+233551234568
South Branch,Kumasi,Bob Johnson,bob.johnson@example.com,+233551234569`

  const downloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-branches-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BRANCH.BULK_UPLOAD)}
      setIsOpen={modal.closeModal}
      title="Bulk Upload Branches"
      position="side"
      panelClass="!w-[864px] p-8"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Text variant="p" className="text-sm text-gray-600">
            Upload a CSV or Excel file to bulk create branches. The file should include the
            following columns:
          </Text>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>
              <strong>branch_name</strong> (required) - Name of the branch
            </li>
            <li>
              <strong>branch_location</strong> (required) - Location/address of the branch
            </li>
            <li>
              <strong>branch_manager_name</strong> (required) - Full name of the branch manager
            </li>
            <li>
              <strong>branch_manager_email</strong> (required) - Email address of the branch manager
            </li>
            <li>
              <strong>phone_number</strong> (required) - Phone number of the branch (e.g.,
              +233551234567)
            </li>
          </ul>
        </div>

        {/* Example Format */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Text variant="span" weight="medium" className="text-sm text-gray-700">
              Example Format:
            </Text>
            <button
              type="button"
              onClick={downloadExample}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <Icon icon="hugeicons:download-01" className="w-4 h-4" />
              Download Example CSV
            </button>
          </div>
          <div className="bg-white rounded border border-gray-300 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    branch_name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    branch_location
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    branch_manager_name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    branch_manager_email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">phone_number</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Main Branch</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    Accra Central
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">John Doe</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    john.doe@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600">+233551234567</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">North Branch</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Accra North</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Jane Smith</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    jane.smith@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600">+233551234568</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <FileUploader
          label="Upload Branches File"
          accept=".csv,.xlsx,.xls"
          value={bulkFile}
          onChange={setBulkFile}
        />

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            // onClick={handleBulkUpload}
            // disabled={!bulkFile || bulkUploadMutation.isPending}
            // loading={bulkUploadMutation.isPending}
          >
            Upload Branches
          </Button>
        </div>
      </div>
    </Modal>
  )
}
