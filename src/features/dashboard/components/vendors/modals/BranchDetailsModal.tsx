import React from 'react'
import { Button, Modal, Text, Tag, Avatar, Input } from '@/components'
import { Icon } from '@/libs'
import { usePersistedModalState } from '@/hooks'
import { MODALS } from '@/utils/constants'
import { getStatusVariant } from '@/utils/helpers/common'
import type { Branch } from '@/features/dashboard/services/branches'

interface BranchDetailsModalProps {
  branch: Branch | null
}

export function BranchDetailsModal({ branch }: BranchDetailsModalProps) {
  const modal = usePersistedModalState({
    paramName: MODALS.BRANCH.VIEW,
  })

  const [isEditing, setIsEditing] = React.useState(false)
  const [editedBranch, setEditedBranch] = React.useState(branch)

  React.useEffect(() => {
    setEditedBranch(branch)
  }, [branch])

  const handleCloseModal = React.useCallback(() => {
    modal.closeModal()
    setIsEditing(false)
  }, [modal])

  if (!branch) return null

  return (
    <Modal
      position="side"
      title="Branch Details"
      isOpen={modal.isModalOpen(MODALS.BRANCH.VIEW)}
      setIsOpen={handleCloseModal}
      panelClass="!w-[864px]"
    >
      <section className="max-w-[480px] w-full mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button type="button" onClick={handleCloseModal}>
                <Icon icon="hugeicons:arrow-left-01" className="text-primary-900" />
              </button>
              <Text as="h2" className="text-xl font-semibold text-gray-900">
                Branch Details
              </Text>
            </div>
            {!isEditing && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditing(true)}
                className="rounded-full"
              >
                Edit
              </Button>
            )}
          </div>

          {/* Branch Profile Section */}
          <div className="bg-white rounded-xl py-5 border border-gray-200">
            <div className="px-6 flex items-center gap-6">
              <section className="flex items-center gap-3 flex-col min-w-40">
                <Avatar
                  name={branch.branch_name}
                  size="lg"
                  className="rounded-xl flex justify-center items-center"
                />
                <div className="py-2.5 px-2 flex flex-col gap-1 text-center capitalize">
                  <Text variant="h4" weight="medium" className="text-gray-800">
                    {branch.branch_name}
                  </Text>
                  <div className="flex gap-2 items-center">
                    <Text variant="span" className="text-secondary-800 text-sm text-nowrap">
                      {branch.branch_code}
                    </Text>
                    <Tag value={branch.status} variant={getStatusVariant(branch.status) as any} />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Branch Information */}
          <div className="flex flex-col gap-6">
            <Text variant="h5" weight="medium">
              Branch Information
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch ID</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.full_branch_id || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, full_branch_id: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.full_branch_id || branch.id}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch Code</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_code || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_code: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_code}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <p className="text-xs text-gray-400">Location</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_location || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_location: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_location}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Branch Type</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_type || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_type: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_type}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Status</p>
                <Tag value={branch.status} variant={getStatusVariant(branch.status) as any} />
              </div>
            </section>
          </div>

          {/* Branch Owner/Manager Section */}
          <div className="border-t border-gray-200 pt-6">
            <Text variant="h5" weight="medium" className="mb-4">
              Branch Owner
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Manager Name</p>
                {isEditing ? (
                  <Input
                    value={editedBranch?.branch_manager_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_manager_name: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_manager_name}</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Manager Email</p>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editedBranch?.branch_manager_email || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedBranch({ ...editedBranch!, branch_manager_email: e.target.value })
                    }
                  />
                ) : (
                  <Text variant="span">{branch.branch_manager_email}</Text>
                )}
              </div>
            </section>
          </div>

          {/* Payment Details Section */}
          <div className="border-t border-gray-200 pt-6">
            <Text variant="h5" weight="medium" className="mb-4">
              Payment Details
            </Text>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Payment Method</p>
                {isEditing ? (
                  <Input
                    value="Mobile Money"
                    onChange={() => {
                      // Handle payment method change
                    }}
                  />
                ) : (
                  <Text variant="span">Mobile Money</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Account Number</p>
                {isEditing ? (
                  <Input
                    value="0244123456"
                    onChange={() => {
                      // Handle account number change
                    }}
                  />
                ) : (
                  <Text variant="span">0244123456</Text>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">Provider</p>
                {isEditing ? (
                  <Input
                    value="MTN"
                    onChange={() => {
                      // Handle provider change
                    }}
                  />
                ) : (
                  <Text variant="span">MTN</Text>
                )}
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                size="medium"
                onClick={() => {
                  // TODO: Save changes
                  setIsEditing(false)
                }}
                className="flex-1 rounded-full"
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="medium"
                onClick={() => {
                  setIsEditing(false)
                  setEditedBranch(branch)
                }}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </section>
    </Modal>
  )
}
