import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button, FileUploader, Modal, Text } from '@/components'
import { bulkUploadGiftCards } from '@/features/dashboard/services/bulkGiftCards'
import { usePersistedModalState, useToast } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'

export function BulkUploadGiftCards() {
  const modal = usePersistedModalState({
    paramName: MODALS.BULK_GIFT_CARDS?.UPLOAD || 'bulk-gift-cards-upload',
  })

  return (
    <>
      <Button
        variant="outline"
        className="cursor-pointer"
        size={'medium'}
        onClick={() => modal.openModal(MODALS.BULK_GIFT_CARDS?.UPLOAD || 'bulk-gift-cards-upload')}
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
  const queryClient = useQueryClient()
  const toast = useToast()

  const bulkUploadMutation = useMutation({
    mutationFn: bulkUploadGiftCards,
    onSuccess: (response) => {
      const message =
        response.data?.successful && response.data?.total
          ? `Successfully uploaded ${response.data.successful} of ${response.data.total} gift cards`
          : 'Gift cards uploaded successfully'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['user-recipients'] })
      setBulkFile(null)
      modal.closeModal()
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload gift cards. Please try again.')
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

  // Example CSV content for bulk gift card upload
  const exampleCSV = `card_id,quantity,amount,name,email,phone,message
1,2,100.00,John Doe,john.doe@example.com,+233551234567,Happy Birthday!
1,1,50.00,Jane Smith,jane.smith@example.com,+233551234568,Thank you for your service
2,3,150.00,Bob Johnson,bob.johnson@example.com,+233551234569,`

  const downloadExample = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-gift-cards-example.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={modal.isModalOpen(MODALS.BULK_GIFT_CARDS?.UPLOAD || 'bulk-gift-cards-upload')}
      setIsOpen={modal.closeModal}
      title="Bulk Upload Gift Cards"
      position="side"
      panelClass="!w-[864px] p-8"
    >
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Text variant="p" className="text-sm text-gray-600">
            Upload a CSV or Excel file to bulk purchase gift cards for employees. The file should
            include the following columns:
          </Text>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>
              <strong>card_id</strong> (required) - The ID of the gift card/experience
            </li>
            <li>
              <strong>quantity</strong> (required) - Number of cards to purchase
            </li>
            <li>
              <strong>amount</strong> (required) - Amount per card
            </li>
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
          <div className="bg-white rounded border border-gray-300 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    card_id
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    quantity
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                    amount
                  </th>
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
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">2</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">100.00</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">John Doe</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    john.doe@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    +233551234567
                  </td>
                  <td className="px-3 py-2 text-gray-600">Happy Birthday!</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">1</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">50.00</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">Jane Smith</td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    jane.smith@example.com
                  </td>
                  <td className="px-3 py-2 text-gray-600 border-r border-gray-300">
                    +233551234568
                  </td>
                  <td className="px-3 py-2 text-gray-600">Thank you for your service</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <FileUploader
          label="Upload Gift Cards File"
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
            Upload Gift Cards
          </Button>
        </div>
      </div>
    </Modal>
  )
}
