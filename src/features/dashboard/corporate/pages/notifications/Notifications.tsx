import React from 'react'
import { Text, Button } from '@/components'
import { cn } from '@/libs'
import {
  useApprovePaymentChange,
  useRejectPaymentChange,
} from '@/features/dashboard/hooks/useNotifications'
import {
  useApproveExperience,
  useRejectExperience,
} from '@/features/dashboard/hooks/useExperienceApproval'

type NotificationTab = 'all' | 'payment-changes' | 'experience-approvals'

export default function Notifications() {
  const [activeTab, setActiveTab] = React.useState<NotificationTab>('all')
  const [rejectReason, setRejectReason] = React.useState('')
  const [selectedCardId, setSelectedCardId] = React.useState<number | null>(null)

  const { mutate: approvePayment, isPending: isApprovingPayment } = useApprovePaymentChange()
  const { mutate: rejectPayment, isPending: isRejectingPayment } = useRejectPaymentChange()

  const { mutate: approveExperience, isPending: isApprovingExperience } = useApproveExperience()
  const { mutate: rejectExperience, isPending: isRejectingExperience } = useRejectExperience()

  // Fetch notifications on mount

  const handleApprovePayment = (notificationId: number) => {
    if (window.confirm('Are you sure you want to approve this payment change?')) {
      approvePayment(notificationId)
    }
  }

  const handleRejectPayment = (notificationId: number) => {
    if (window.confirm('Are you sure you want to reject this payment change?')) {
      rejectPayment(notificationId)
    }
  }

  const handleApproveExperience = (cardId: number) => {
    if (window.confirm('Are you sure you want to approve this experience?')) {
      approveExperience(cardId)
    }
  }

  const handleRejectExperience = (cardId: number) => {
    setSelectedCardId(cardId)
  }

  const confirmRejectExperience = () => {
    if (selectedCardId) {
      rejectExperience({ cardId: selectedCardId, reason: rejectReason || undefined })
      setSelectedCardId(null)
      setRejectReason('')
    }
  }

  const tabs = [
    {
      id: 'all' as NotificationTab,
      label: 'All',
      count: 0,
    },
  ]

  return (
    <div className="py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Text variant="h2" weight="semibold" className="text-primary-900">
            Notifications
          </Text>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors relative',
                activeTab === tab.id
                  ? 'border-[#402D87] text-[#402D87]'
                  : 'border-transparent text-gray-600 hover:text-gray-900',
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'ml-2 px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.id ? 'bg-[#402D87] text-white' : 'bg-gray-200 text-gray-700',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Text variant="h3" weight="semibold" className="text-gray-900">
              Payment Change Requests
            </Text>
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Text variant="h4" weight="semibold" className="text-gray-900">
                    Branch Name
                  </Text>
                  <Text variant="p" className="text-sm text-gray-600">
                    Branch Manager: Branch Manager Name (branchmanager@example.com)
                  </Text>
                  <Text variant="p" className="text-xs text-gray-500 mt-1">
                    Requested on January 15, 2026
                  </Text>
                </div>
                <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                  Pending
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <Text variant="span" weight="medium" className="text-sm text-red-800 mb-2 block">
                    Current Payment Method
                  </Text>
                  <div className="text-sm text-gray-700">
                    <p>Bank Account</p>
                    <p className="text-xs text-gray-600">Bank: Bank Name</p>
                    <p className="text-xs text-gray-600">Account: Account Number</p>
                    <p className="text-xs text-gray-600">Name: Account Name</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <Text
                    variant="span"
                    weight="medium"
                    className="text-sm text-green-800 mb-2 block"
                  >
                    New Payment Method
                  </Text>
                  <div className="text-sm text-gray-700">
                    <p>Bank Account</p>
                    <p className="text-xs text-gray-600">Bank: Bank Name</p>
                    <p className="text-xs text-gray-600">Account: Account Number</p>
                    <p className="text-xs text-gray-600">Name: Account Name</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => handleApprovePayment(1)}
                  disabled={isApprovingPayment || isRejectingPayment}
                  variant="primary"
                  size="small"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleRejectPayment(1)}
                  disabled={isApprovingPayment || isRejectingPayment}
                  variant="outline"
                  size="small"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>

          {/* Experience Approval Notifications */}
          <div className="space-y-4">
            <Text variant="h3" weight="semibold" className="text-gray-900">
              Experience Approval Requests
            </Text>
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Text variant="h4" weight="semibold" className="text-gray-900">
                    Branch Name
                  </Text>
                  <Text variant="p" className="text-sm text-gray-600">
                    Branch Manager: Branch Manager Name (branchmanager@example.com)
                  </Text>
                  <Text variant="p" className="text-xs text-gray-500 mt-1">
                    Requested on January 15, 2026
                  </Text>
                </div>
                <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                  Pending Approval
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApproveExperience(1)}
                  disabled={isApprovingExperience || isRejectingExperience}
                  variant="primary"
                  size="small"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleRejectExperience(1)}
                  disabled={isApprovingExperience || isRejectingExperience}
                  variant="outline"
                  size="small"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#402D87]"
            rows={4}
            placeholder="Enter reason for rejection..."
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={() => {
              setRejectReason('')
              setSelectedCardId(null)
            }}
            variant="outline"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmRejectExperience}
            disabled={isRejectingExperience}
            variant="primary"
            size="small"
          >
            {isRejectingExperience ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  )
}
