import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button, FileUploader, Modal, Text } from '@/components'
import { bulkAssignRecipients } from '@/features/dashboard/services/recipients'
import { usePersistedModalState, useToast } from '@/hooks'
import { Icon } from '@/libs'
import { MODAL_NAMES } from '@/utils/constants'

export function BulkUploadRecipient() {
  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.BULK_UPLOAD,
  })
  const [bulkFile, setBulkFile] = React.useState<File | null>(null)
  const queryClient = useQueryClient()
  const toast = useToast()

  const bulkUploadMutation = useMutation({
    mutationFn: bulkAssignRecipients,
    onSuccess: () => {
      toast.success('Recipients uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['user-recipients'] })

      setBulkFile(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload recipients. Please try again.')
    },
  })

  const handleBulkUpload = () => {
    if (!bulkFile) return
    bulkUploadMutation.mutate(bulkFile)
  }

  const handleClose = () => {
    setBulkFile(null)
    modal.closeModal()
  }

  // Example CSV content
  const exampleCSV = `name,email,phone,message
John Doe,john.doe@example.com,+1234567890,Happy Birthday!
Jane Smith,jane.smith@example.com,+0987654321,Thank you for your service
Bob Johnson,bob.johnson@example.com,+1122334455,`

  const downloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recipients-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODAL_NAMES.RECIPIENT.BULK_UPLOAD)}
      setIsOpen={modal.closeModal}
      title="Bulk Upload Recipients"
      panelClass="max-w-2xl"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Text variant="p" className="text-sm text-gray-600">
            Upload a CSV or Excel file containing recipient information. The file should include the
            following columns:
          </Text>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>
              <strong>name</strong> (required) - Recipient's full name
            </li>
            <li>
              <strong>email</strong> (required) - Recipient's email address
            </li>
            <li>
              <strong>phone</strong> (optional) - Recipient's phone number
            </li>
            <li>
              <strong>message</strong> (optional) - Personal message for the recipient
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
          <div className="bg-white rounded border border-gray-300 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    name
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    phone
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">message</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">John Doe</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    john.doe@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">+1234567890</td>
                  <td className="px-3 py-2 text-gray-600">Happy Birthday!</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Jane Smith</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    jane.smith@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">+0987654321</td>
                  <td className="px-3 py-2 text-gray-600">Thank you for your service</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Bob Johnson</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    bob.johnson@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">+1122334455</td>
                  <td className="px-3 py-2 text-gray-600">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <FileUploader
          label="Upload Recipients File"
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
            onClick={handleBulkUpload}
            disabled={!bulkFile || bulkUploadMutation.isPending}
            loading={bulkUploadMutation.isPending}
          >
            Upload Recipients
          </Button>
        </div>
      </div>
    </Modal>
  )
}
