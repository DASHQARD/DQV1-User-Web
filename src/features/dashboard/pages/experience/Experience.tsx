import { useState } from 'react'
import { Icon } from '@/libs'
import { Button } from '@/components/Button'
import { DataTable, Loader, Modal, Popover, PopoverTrigger, PopoverContent } from '@/components'
import { useCards, useDeleteCard } from '../../hooks'
import type { ColumnDef } from '@tanstack/react-table'
import type { CardResponse } from '@/types/cards'
import { CreateEditCardModal } from './CreateEditCardModal'
import { CardDetailsModal } from './CardDetailsModal'
import { useUserProfile } from '@/hooks'

export default function Experience() {
  const { data: cardsResponse, isLoading } = useCards()
  const { mutate: deleteCard, isPending: isDeleting } = useDeleteCard()
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCard, setEditingCard] = useState<CardResponse | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)

  console.log('cardsResponse', cardsResponse)

  const { data: userProfile } = useUserProfile()

  console.log('userProfile', userProfile)

  // Filter cards based on user type
  // Corporate users: only show corporate cards (vendor_id is null or 0)
  // Corporate_vendor users: show both vendor and corporate cards

  const handleViewDetails = (cardId: number) => {
    setSelectedCardId(cardId)
    setShowDetailsModal(true)
    setOpenPopoverId(null)
  }

  const handleEdit = (card: CardResponse) => {
    setEditingCard(card)
    setShowCreateModal(true)
    setOpenPopoverId(null)
  }

  const handleDelete = (cardId: number) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(cardId)
      setOpenPopoverId(null)
    }
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    setEditingCard(null)
  }

  const handleCreateExperience = () => {
    const status = userProfile?.status?.toLowerCase()
    const isApproved = status === 'active' || status === 'verified'

    if (!isApproved) {
      setShowApprovalModal(true)
      return
    }

    setShowCreateModal(true)
  }

  const columns: ColumnDef<CardResponse>[] = [
    {
      accessorKey: 'product',
      header: 'Product',
      cell: ({ row }) => <div className="font-medium text-gray-900">{row.original.product}</div>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = parseFloat(row.original.price)
        return (
          <div className="text-gray-900">
            {new Intl.NumberFormat('en-GH', {
              style: 'currency',
              currency: row.original.currency || 'GHS',
            }).format(price)}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusColors[status as keyof typeof statusColors] || statusColors.inactive
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Issue Date',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at)
        return (
          <div className="text-gray-600">
            {date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'expiry_date',
      header: 'Expiry Date',
      cell: ({ row }) => {
        const date = new Date(row.original.expiry_date)
        return (
          <div className="text-gray-600">
            {date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const card = row.original
        return (
          <Popover
            open={openPopoverId === card.id}
            onOpenChange={(open) => setOpenPopoverId(open ? card.id : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                title="Actions"
              >
                <Icon icon="bi:three-dots-vertical" className="text-xl" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-48 p-1 border border-gray-200 rounded-lg shadow-lg bg-white"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    handleViewDetails(card.id)
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Icon icon="bi:eye" className="text-lg" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleEdit(card)
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Icon icon="bi:pencil" className="text-lg" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(card.id)
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon icon="bi:trash" className="text-lg" />
                  <span>Delete</span>
                </button>
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Experiences</h1>
            <p className="text-gray-600">Manage your gift card experiences and products</p>
          </div>
          <Button variant="secondary" onClick={handleCreateExperience}>
            <Icon icon="bi:plus-circle" className="mr-2" />
            Create Experience
          </Button>
        </div>

        {/* Cards Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader />
            </div>
          ) : (
            <DataTable columns={columns} data={cardsResponse?.data || []} />
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateEditCardModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          editingCard={editingCard}
        />
      )}

      {/* Details Modal */}
      {selectedCardId && (
        <CardDetailsModal
          cardId={selectedCardId}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedCardId(null)
          }}
        />
      )}

      {/* Approval Required Modal */}
      <Modal
        isOpen={showApprovalModal}
        setIsOpen={setShowApprovalModal}
        title="Account Approval Required"
        position="center"
      >
        <div className="px-6 py-4">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Icon icon="bi:clock-history" className="text-3xl text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Account is Pending Approval
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To create experiences and manage gift cards, your account needs to be verified by our
              admin team. We're currently reviewing your account and will notify you once the
              approval process is complete.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Icon icon="bi:info-circle" className="text-blue-600 text-xl shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Our team will review your account details</li>
                  <li>You'll receive a notification once approved</li>
                  <li>You can then start creating experiences</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
