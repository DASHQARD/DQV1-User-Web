import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Text, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { useCart } from '../../hooks/useCart'
import {
  assignRecipient,
  deleteRecipient,
  getRecipients,
  updateRecipient,
  updateRecipientAmount,
} from '@/features/dashboard/services'
import type {
  AssignRecipientPayload,
  RecipientResponse,
  CartItemResponse,
  UpdateRecipientPayload,
  UpdateRecipientAmountPayload,
} from '@/types/cart'
import { useToast } from '@/hooks'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashpass_bg.svg'
import { ENV_VARS } from '@/utils/constants'
import { deleteCartItem } from '../../services/cart'

export default function ViewBag() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()
  const [selectedCartItem, setSelectedCartItem] = useState<CartItemResponse | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientResponse | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recipientToDelete, setRecipientToDelete] = useState<RecipientResponse | null>(null)

  // Get recipients for all carts
  const { data: recipientsData } = useQuery({
    queryKey: ['cart-recipients'],
    queryFn: () => getRecipients(),
    enabled: Array.isArray(cartItems) && cartItems.length > 0,
  })

  // Assign recipient mutation
  const assignMutation = useMutation({
    mutationFn: assignRecipient,
    onSuccess: () => {
      toast.success('Recipient assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      setIsModalOpen(false)
      setSelectedCartItem(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign recipient')
    },
  })

  // Delete cart item mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCartItem,
    onSuccess: () => {
      toast.success('Item removed from cart')
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove item')
    },
  })

  // Delete recipient mutation
  const deleteRecipientMutation = useMutation({
    mutationFn: deleteRecipient,
    onSuccess: () => {
      toast.success('Recipient removed successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove recipient')
    },
  })

  // Update recipient mutation (for DashPass and DashX)
  const updateRecipientMutation = useMutation({
    mutationFn: updateRecipient,
    onSuccess: () => {
      toast.success('Recipient updated successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      setIsModalOpen(false)
      setSelectedCartItem(null)
      setSelectedRecipient(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update recipient')
    },
  })

  // Update recipient amount mutation (for DashGo and DashPro)
  const updateRecipientAmountMutation = useMutation({
    mutationFn: updateRecipientAmount,
    onSuccess: () => {
      toast.success('Recipient updated successfully')
      queryClient.invalidateQueries({ queryKey: ['cart-recipients'] })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      setIsModalOpen(false)
      setSelectedCartItem(null)
      setSelectedRecipient(null)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update recipient')
    },
  })

  // Construct full image URL from file_url
  const getImageUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return ''

    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }

    let baseUrl = ENV_VARS.API_BASE_URL
    if (baseUrl.endsWith('/api/v1')) {
      baseUrl = baseUrl.replace('/api/v1', '')
    }
    return `${baseUrl}/uploads/${fileUrl}`
  }

  // Get card background based on type
  const getCardBackground = (type: string) => {
    const normalizedType = type?.toLowerCase()
    switch (normalizedType) {
      case 'dashx':
        return DashxBg
      case 'dashpro':
        return DashproBg
      case 'dashpass':
        return DashpassBg
      case 'dashgo':
        return DashxBg
      default:
        return DashxBg
    }
  }

  // Use cart items directly without grouping
  const displayCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems
  }, [cartItems])

  // Group recipients by cart_id
  const recipients = useMemo(() => recipientsData?.data || [], [recipientsData?.data])
  const recipientsByCart = useMemo(() => {
    const grouped: Record<number, RecipientResponse[]> = {}
    recipients.forEach((recipient: RecipientResponse) => {
      if (!grouped[recipient.cart_id]) {
        grouped[recipient.cart_id] = []
      }
      grouped[recipient.cart_id].push(recipient)
    })
    return grouped
  }, [recipients])

  const handleAddRecipient = (item: CartItemResponse) => {
    setSelectedCartItem(item)
    setSelectedRecipient(null)
    setIsModalOpen(true)
  }

  const handleEditRecipient = (item: CartItemResponse, recipient: RecipientResponse) => {
    setSelectedCartItem(item)
    setSelectedRecipient(recipient)
    setIsModalOpen(true)
  }

  const handleDeleteRecipient = (recipient: RecipientResponse) => {
    if (!recipient || !recipient.id) {
      toast.error('Invalid recipient data. Cannot delete.')
      return
    }
    setRecipientToDelete(recipient)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteRecipient = () => {
    if (recipientToDelete && recipientToDelete.id) {
      deleteRecipientMutation.mutate(recipientToDelete.id, {
        onSuccess: () => {
          setIsDeleteModalOpen(false)
          setRecipientToDelete(null)
        },
      })
    } else {
      toast.error('Invalid recipient ID. Please try again.')
      setIsDeleteModalOpen(false)
      setRecipientToDelete(null)
    }
  }

  const handleSaveRecipient = (data: {
    amount: number
    name?: string
    phone?: string
    email?: string
    message?: string
    assign_to_self?: boolean
  }) => {
    if (!selectedCartItem) return

    // If editing an existing recipient
    if (selectedRecipient) {
      const normalizedType = selectedCartItem.type?.toLowerCase()
      const isDashProOrDashGo = normalizedType === 'dashpro' || normalizedType === 'dashgo'

      if (isDashProOrDashGo) {
        // Use updateRecipientAmount for DashPro and DashGo
        const payload: UpdateRecipientAmountPayload = {
          id: selectedRecipient.id,
          cart_id: selectedCartItem.cart_id,
          amount: data.amount.toString(),
          name: data.name || selectedRecipient.name,
          email: data.email || selectedRecipient.email,
          phone: data.phone || selectedRecipient.phone,
          message: data.message || selectedRecipient.message || '',
        }
        updateRecipientAmountMutation.mutate(payload)
      } else {
        // Use updateRecipient for DashPass and DashX
        const payload: UpdateRecipientPayload = {
          id: selectedRecipient.id,
          cart_id: selectedCartItem.cart_id,
          name: data.name || selectedRecipient.name,
          email: data.email || selectedRecipient.email,
          phone: data.phone || selectedRecipient.phone,
          message: data.message || selectedRecipient.message || '',
        }
        updateRecipientMutation.mutate(payload)
      }
    } else {
      // Adding a new recipient
      const payload: AssignRecipientPayload = {
        cart_id: selectedCartItem.cart_id,
        quantity: 1,
        amount: data.amount,
        message: data.message || '',
        assign_to_self: data.assign_to_self,
      }

      if (!data.assign_to_self) {
        payload.name = data.name
        payload.email = data.email
        payload.phone = data.phone
      }

      assignMutation.mutate(payload)
    }
  }

  const handleRemoveItem = (cartId: number) => {
    deleteMutation.mutate(cartId)
  }

  const formatPrice = (price: string | number | undefined | null) => {
    if (price === undefined || price === null) return 'GHS 0.00'
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice) || !isFinite(numPrice)) return 'GHS 0.00'
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(numPrice)
  }

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total: number, item: CartItemResponse) => {
        return total + parseFloat(item.amount)
      }, 0)
    : 0

  const totalItems = Array.isArray(cartItems) ? cartItems.length : 0

  if (isLoadingCart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MY BAG ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {displayCartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
                <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
                <Button onClick={() => navigate('/dashqards')} className="mt-6" variant="primary">
                  Browse Cards
                </Button>
              </div>
            ) : (
              displayCartItems.map((item: CartItemResponse) => {
                const cardBackground = getCardBackground(item.type)
                const cardImageUrl = item.images?.[0]?.file_url
                  ? getImageUrl(item.images[0].file_url)
                  : null

                // Get recipients for this cart item
                const itemRecipients = recipientsByCart[item.cart_id] || []
                const quantity = parseInt(item.recipient_count || '1', 10)
                const displayPrice = parseFloat(item.amount)

                return (
                  <div
                    key={item.cart_id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex gap-6">
                      {/* Card Image */}
                      <div className="w-40 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                        <img
                          src={cardBackground}
                          alt={`${item.type} card background`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {cardImageUrl && (
                          <img
                            src={cardImageUrl}
                            alt={`${item.product} card image`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {item.vendor_name}: {item.product}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Type: {item.type}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.cart_id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Icon icon="bi:trash" className="text-xl" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <Text variant="p" weight="bold" className="text-primary-500 text-lg">
                            {item.currency} {displayPrice.toFixed(2)}
                          </Text>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm">
                            <button
                              type="button"
                              onClick={() => {
                                if (quantity > 1) {
                                  // TODO: Implement quantity decrease API call
                                } else {
                                  handleRemoveItem(item.cart_id)
                                }
                              }}
                              className="p-2 hover:bg-gray-50 rounded-l-full transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Icon icon="bi:dash-lg" className="text-lg text-gray-600" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700 min-w-8 text-center">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                // TODO: Implement quantity increase API call
                              }}
                              className="p-2 hover:bg-gray-50 rounded-r-full transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Icon icon="bi:plus" className="text-lg text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Recipients Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Recipients ({itemRecipients.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddRecipient(item)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white border border-black rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Icon icon="bi:plus-circle" className="text-base" />
                              Add Recipient
                            </button>
                          </div>

                          {itemRecipients.length > 0 ? (
                            <div className="space-y-2 mt-2">
                              {itemRecipients
                                .filter((recipient) => recipient && recipient.id)
                                .map((recipient) => (
                                  <div
                                    key={recipient.id}
                                    className="bg-gray-50 rounded-lg p-3 text-sm"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                          {recipient.name || 'Self'}
                                        </p>
                                        {recipient.email && (
                                          <p className="text-gray-600 text-xs mt-1">
                                            {recipient.email}
                                          </p>
                                        )}
                                        {recipient.phone && (
                                          <p className="text-gray-600 text-xs">{recipient.phone}</p>
                                        )}
                                      </div>
                                      <span className="text-primary-500 font-semibold">
                                        {formatPrice(recipient.amount ?? 0)}
                                      </span>
                                    </div>
                                    <div className="flex gap-2 justify-end mt-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditRecipient(item, recipient)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                      >
                                        <Icon icon="bi:pencil" className="text-sm" />
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRecipient(recipient)}
                                        disabled={deleteRecipientMutation.isPending}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                      >
                                        <Icon icon="bi:trash" className="text-sm" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              No recipients added yet. Click "Add Recipient" to assign.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Taxes</span>
                  <span className="text-gray-500">Calculated at Checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                variant="primary"
                className="w-full mb-4"
              >
                Proceed to Checkout
              </Button>

              <Button onClick={() => navigate('/dashqards')} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Modal */}
      {selectedCartItem && (
        <PurchaseModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCartItem(null)
            setSelectedRecipient(null)
          }}
          onSave={handleSaveRecipient}
          cardType={selectedCartItem.type}
          cardProduct={selectedCartItem.product}
          cardCurrency={selectedCartItem.currency}
          initialData={
            selectedRecipient
              ? {
                  amount: selectedRecipient.amount,
                  name: selectedRecipient.name,
                  email: selectedRecipient.email,
                  phone: selectedRecipient.phone,
                  message: selectedRecipient.message || '',
                }
              : {
                  amount: parseFloat(selectedCartItem.amount),
                }
          }
        />
      )}

      {/* Delete Recipient Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} setIsOpen={setIsDeleteModalOpen} panelClass="!max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Icon icon="bi:exclamation-triangle-fill" className="text-2xl text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Delete Recipient</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>

          {recipientToDelete && (
            <div className="mb-6">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to remove this recipient?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="font-semibold text-gray-900">{recipientToDelete.name || 'Self'}</p>
                {recipientToDelete.email && (
                  <p className="text-sm text-gray-600 mt-1">{recipientToDelete.email}</p>
                )}
                {recipientToDelete.phone && (
                  <p className="text-sm text-gray-600">{recipientToDelete.phone}</p>
                )}
                <p className="text-sm font-semibold text-primary-500 mt-2">
                  {formatPrice(recipientToDelete.amount ?? 0)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setRecipientToDelete(null)
              }}
              disabled={deleteRecipientMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDeleteRecipient}
              disabled={deleteRecipientMutation.isPending}
              loading={deleteRecipientMutation.isPending}
            >
              {deleteRecipientMutation.isPending ? 'Deleting...' : 'Delete Recipient'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
