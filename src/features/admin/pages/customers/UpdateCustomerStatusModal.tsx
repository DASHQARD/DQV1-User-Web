import React, { useState } from 'react'
import { Modal, Button } from '@/components'
import { useUpdateCustomerStatus } from '../../hooks/useUpdateCustomerStatus'
import { useToast } from '@/hooks'
import type { Customer } from '@/types/customer'

interface UpdateCustomerStatusModalProps {
  customer: Customer | null
  isOpen: boolean
  onClose: () => void
}

const statusOptions = [
  { label: 'Suspended', value: 'suspended' },
  { label: 'Verified', value: 'verified' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function UpdateCustomerStatusModal({
  customer,
  isOpen,
  onClose,
}: UpdateCustomerStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(customer?.status || '')
  const { mutate: updateStatus, isPending } = useUpdateCustomerStatus()
  const toast = useToast()

  React.useEffect(() => {
    if (customer) {
      setSelectedStatus(customer.status)
    }
  }, [customer])

  const handleSubmit = () => {
    if (!customer) return

    updateStatus(
      {
        user_id: String(customer.id),
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          toast.success('Customer status updated successfully')
          onClose()
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to update customer status')
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title="Update Customer Status"
      position="center"
    >
      <div className="px-6 py-4">
        {customer && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Customer Email</label>
              <p className="text-base font-normal text-gray-900">{customer.email}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Current Status</label>
              <p className="text-base font-normal text-gray-900 capitalize">{customer.status}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">New Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg py-3 px-4 text-sm bg-white text-gray-900 cursor-pointer transition-colors focus:border-[#402D87] focus:outline-none focus:ring-2 focus:ring-[#402D87]/25 hover:border-gray-400"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-2"
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSubmit}
                className="flex-1 bg-linear-to-br from-[#402D87] to-[#5a4fcf] text-white hover:from-[#2d1a72] hover:to-[#402D87]"
                loading={isPending}
                disabled={isPending || selectedStatus === customer.status}
              >
                Update Status
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

