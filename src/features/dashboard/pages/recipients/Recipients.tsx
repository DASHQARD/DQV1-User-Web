import { Button, DataTable, Text } from '@/components'
import type { ColumnDef } from '@tanstack/react-table'
import { Icon } from '@/libs'

import { useRecipients } from '../../hooks'
import { BulkUploadRecipient, CreateRecipient } from '../../components'
import { MODAL_NAMES } from '@/utils/constants'
import { usePersistedModalState } from '@/hooks'

export default function Recipients() {
  const { useUserRecipientService } = useRecipients()
  const { data: recipients, isLoading } = useUserRecipientService()
  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.ROOT,
  })
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
  ]

  const hasRecipients = recipients?.data && recipients.data.length > 0

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Text variant="h2" weight="semibold" className="text-primary-900">
          Recipients management
        </Text>
        {hasRecipients && <CreateRecipient />}
      </div>

      {/* Content */}
      {!isLoading && !hasRecipients ? (
        <div className="w-full mt-12">
          <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
                  <Icon icon="hugeicons:user-group-01" className="w-10 h-10 text-primary-600" />
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-2">
                <Text variant="h3" weight="semibold" className="text-gray-900">
                  No recipients yet
                </Text>
                <Text variant="p" className="text-gray-600 max-w-md mx-auto">
                  Get started by uploading recipients. You can either upload a single recipient or
                  bulk upload multiple recipients at once using a CSV or Excel file.
                </Text>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  variant="secondary"
                  size="medium"
                  onClick={() => modal.openModal(MODAL_NAMES.RECIPIENT.BULK_UPLOAD)}
                  className="flex items-center gap-2"
                >
                  <Icon icon="hugeicons:upload-01" className="w-5 h-5" />
                  Bulk Upload
                </Button>
                <CreateRecipient />
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-left space-y-2">
                  <Text variant="span" weight="medium" className="text-sm text-gray-700">
                    Bulk Upload Format:
                  </Text>
                  <Text variant="p" className="text-xs text-gray-600">
                    Your CSV or Excel file should include columns: <strong>name</strong> and{' '}
                    <strong>email</strong> (required), with optional columns for{' '}
                    <strong>phone</strong> and <strong>message</strong>.
                  </Text>
                  <button
                    type="button"
                    onClick={() => modal.openModal(MODAL_NAMES.RECIPIENT.BULK_UPLOAD)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
                  >
                    View example format →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <DataTable columns={columns} data={recipients?.data || []} isLoading={isLoading} />
        </div>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadRecipient />
    </div>
  )
}
