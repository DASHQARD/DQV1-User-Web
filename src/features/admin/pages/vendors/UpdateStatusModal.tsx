import React, { useState } from 'react'
import { Modal, Button } from '@/components'
import { useUpdateVendorStatus } from '../../hooks/useUpdateVendorStatus'
import { useToast } from '@/hooks'
import type { Vendor } from '@/types/vendor'

interface UpdateStatusModalProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
}

const statusOptions = [
  { label: 'Suspended', value: 'suspended' },
  { label: 'Verified', value: 'verified' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function UpdateStatusModal({ vendor, isOpen, onClose }: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(vendor?.status || '')
  const { mutate: updateStatus, isPending } = useUpdateVendorStatus()
  const toast = useToast()

  React.useEffect(() => {
    if (vendor) {
      setSelectedStatus(vendor.status)
    }
  }, [vendor])

  const handleSubmit = () => {
    if (!vendor) return

    updateStatus(
      {
        user_id: vendor.id,
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          toast.success('Vendor status updated successfully')
          onClose()
        },
        onError: (error: any) => {
          toast.error(error?.message || 'Failed to update vendor status')
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={(open) => !open && onClose()}
      title="Update Vendor Status"
      position="center"
    >
      <div className="px-6 py-4">
        {vendor && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Vendor Email</label>
              <p className="text-base font-normal text-gray-900">{vendor.email}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Current Status</label>
              <p className="text-base font-normal text-gray-900 capitalize">{vendor.status}</p>
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
                disabled={isPending || selectedStatus === vendor.status}
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
