import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Text, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { useCart } from '../../hooks/useCart'
import { usePersistedModalState } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { deleteRecipient } from '@/features/dashboard/services'
import { useToast } from '@/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { ENV_VARS } from '@/utils/constants'
import { deleteCartItem } from '../../services/cart'
import { formatCurrency } from '@/utils/format'
import type { CartListResponse } from '@/types/responses'

export default function ViewBag() {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { cartItems, isLoading: isLoadingCart } = useCart()
  const modal = usePersistedModalState<{
    cart_item_id: number
    cardType?: string
    cardProduct?: string
    cardCurrency?: string
    amount?: number
  }>({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recipientToDelete, setRecipientToDelete] = useState<any | null>(null)

  // Filter out paid carts
  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return cartItems.filter((cart: CartListResponse) => cart.cart_status?.toLowerCase() !== 'paid')
  }, [cartItems])

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
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove recipient')
    },
  })

  // Note: PurchaseModal handles recipient assignment/updates internally

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
        return DashgoBg
      default:
        return DashxBg
    }
  }

  // Flatten cart items from nested structure
  // Recipients are now included directly in the cart items from /carts endpoint
  type FlattenedCartItem = {
    cart_id: number
    card_id: number
    product: string
    vendor_name?: string
    type: string
    currency: string
    price: string
    amount: string
    images?: Array<{ file_url: string; file_name: string }>
    cart_item_id?: number
    total_quantity?: number
    recipients?: Array<{
      email: string
      phone: string
      message: string
      name?: string
      amount?: string
    }>
  }

  const displayCartItems = useMemo(() => {
    if (!Array.isArray(activeCartItems)) return []

    const flattened: FlattenedCartItem[] = []

    activeCartItems.forEach((cart: CartListResponse) => {
      // Each cart has an items object (not array in the new structure)
      if (cart.items) {
        // Handle both array and single object cases
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]

        itemsArray.forEach((item: any) => {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined, // May not be in nested structure
            type: item.type || 'dashx',
            currency: 'GHS', // Default, adjust if available
            price: item.total_amount?.toString() || '0',
            amount: item.total_amount?.toString() || '0',
            images: item.images || [],
            cart_item_id: item.cart_item_id,
            total_quantity: item.total_quantity || 1,
            recipients: item.recipients || [], // Recipients are now included in cart items
          })
        })
      }
    })

    return flattened
  }, [activeCartItems])

  // Group recipients by cart_item_id from cart items (recipients are now included in cart response)
  const recipientsByCartItem = useMemo(() => {
    const grouped: Record<number, any[]> = {}

    displayCartItems.forEach((item: FlattenedCartItem) => {
      if (item.cart_item_id && item.recipients && item.recipients.length > 0) {
        // Calculate per-recipient amount: total_amount / total_quantity
        const totalAmount = parseFloat(item.amount || '0')
        const totalQuantity = item.total_quantity || 1
        const perRecipientAmount = totalAmount / totalQuantity

        grouped[item.cart_item_id] = item.recipients.map((recipient, index) => ({
          id: `${item.cart_item_id}-${index}`, // Generate unique ID
          name: recipient.name || recipient.email?.split('@')[0] || 'Recipient',
          email: recipient.email,
          phone: recipient.phone,
          message: recipient.message || '',
          amount: parseFloat(recipient.amount || perRecipientAmount.toString() || '0'),
          cart_id: item.cart_id,
          cart_item_id: item.cart_item_id,
        }))
      }
    })

    return grouped
  }, [displayCartItems])

  const handleAddRecipient = (item: FlattenedCartItem) => {
    if (!item.cart_item_id) {
      toast.error('Cart item ID is required')
      return
    }
    // Calculate per-recipient amount: total_amount / total_quantity
    const totalAmount = parseFloat(item.amount || '0')
    const totalQuantity = item.total_quantity || 1
    const perRecipientAmount = totalAmount / totalQuantity

    modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
      cart_item_id: item.cart_item_id,
      cardType: item.type,
      cardProduct: item.product,
      cardCurrency: item.currency || 'GHS',
      amount: perRecipientAmount,
    })
  }

  const handleEditRecipient = (item: FlattenedCartItem, recipient: any) => {
    if (!item.cart_item_id) {
      toast.error('Cart item ID is required')
      return
    }
    modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
      cart_item_id: item.cart_item_id,
      cardType: item.type,
      cardProduct: item.product,
      cardCurrency: item.currency || 'GHS',
      amount: recipient.amount,
    })
  }

  // const handleDeleteRecipient = (recipient: any) => {
  //   if (!recipient || !recipient.id) {
  //     toast.error('Invalid recipient data. Cannot delete.')
  //     return
  //   }
  //   // Extract numeric ID from the generated string ID (format: "cart_item_id-index")
  //   const numericId =
  //     typeof recipient.id === 'string' ? parseInt(recipient.id.split('-')[0]) : recipient.id
  //   if (!numericId) {
  //     toast.error('Invalid recipient ID. Cannot delete.')
  //     return
  //   }
  //   setRecipientToDelete({ ...recipient, id: numericId })
  //   setIsDeleteModalOpen(true)
  // }

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

  // Note: PurchaseModal handles save internally via useAssignRecipientService
  // The modal state is managed via URL params through usePersistedModalState

  const handleRemoveItem = (cartId: number) => {
    deleteMutation.mutate(cartId)
  }

  // Calculate total amount from cart totals
  const subtotal = useMemo(() => {
    return activeCartItems.reduce(
      (sum: number, cart: CartListResponse) => sum + parseFloat(cart.total_amount || '0'),
      0,
    )
  }, [activeCartItems])

  const totalItems = displayCartItems.length

  // Get card type display name
  const getCardTypeName = (type: string | undefined) => {
    if (!type || !type.trim()) return 'DASHQARD'
    const normalizedType = type.toLowerCase().trim()
    switch (normalizedType) {
      case 'dashx':
        return 'DASHX'
      case 'dashpro':
        return 'DASHPRO'
      case 'dashpass':
        return 'DASHPASS'
      case 'dashgo':
        return 'DASHGO'
      default:
        return type.toUpperCase().trim()
    }
  }

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
              displayCartItems.map((item: FlattenedCartItem) => {
                const cardBackground = getCardBackground(item.type || '')
                const cardImageUrl = item.images?.[0]?.file_url
                  ? getImageUrl(item.images[0].file_url)
                  : null

                // Get recipients from cart item (recipients are now included in cart response)
                const itemRecipients =
                  item.cart_item_id && recipientsByCartItem[item.cart_item_id]
                    ? recipientsByCartItem[item.cart_item_id]
                    : []

                const displayPrice = parseFloat(item.amount || '0')
                const hasRecipients = itemRecipients.length > 0

                return (
                  <div
                    key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
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
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {item.product || `Card #${item.card_id}`}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <span>{getCardTypeName(item.type)}</span>
                              <span>•</span>
                              <span>ID: {item.card_id}</span>
                            </div>
                            {hasRecipients && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                <Icon icon="bi:check-circle" className="size-3" />
                                {itemRecipients.length} Recipient
                                {itemRecipients.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.cart_item_id || item.cart_id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Icon icon="bi:trash" className="text-xl" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <Text variant="p" weight="bold" className="text-primary-500 text-lg">
                            {formatCurrency(displayPrice)}
                          </Text>
                        </div>

                        {/* Recipients Section */}
                        {hasRecipients && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="space-y-2">
                              {itemRecipients.map((recipient) => (
                                <div
                                  key={recipient.id}
                                  className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">
                                      {recipient.name}
                                    </p>
                                    <p className="text-gray-500 truncate">{recipient.email}</p>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <span className="text-gray-600 font-medium">
                                      {formatCurrency(recipient.amount)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleEditRecipient(item, recipient)}
                                      className="text-blue-600 hover:text-blue-700 p-1"
                                      aria-label="Edit recipient"
                                    >
                                      <Icon icon="bi:pencil" className="text-sm" />
                                    </button>
                                    {/* <button
                                      type="button"
                                      onClick={() => handleDeleteRecipient(recipient)}
                                      disabled={deleteRecipientMutation.isPending}
                                      className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                                      aria-label="Delete recipient"
                                    >
                                      <Icon icon="bi:trash" className="text-sm" />
                                    </button> */}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Recipient Button */}
                        <div className="mt-4">
                          {itemRecipients.length < (item.total_quantity || 1) && (
                            <Button
                              onClick={() => handleAddRecipient(item)}
                              variant="outline"
                              size="small"
                              className="w-full sm:w-auto"
                            >
                              <Icon icon="bi:person-plus" className="mr-1.5" />
                              {itemRecipients.length > 0
                                ? 'Add Another Recipient'
                                : 'Assign Recipient'}
                            </Button>
                          )}
                          {itemRecipients.length >= (item.total_quantity || 1) && (
                            <div className="text-sm text-gray-500 italic">
                              Maximum recipients reached (quantity: {item.total_quantity || 1})
                            </div>
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
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                variant="secondary"
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

      {/* Recipient Modal - PurchaseModal uses URL params via usePersistedModalState */}
      <PurchaseModal />

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
                  {formatCurrency(recipientToDelete.amount ?? 0)}
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
