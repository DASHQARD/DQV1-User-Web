import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Text, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { useCart } from '../../hooks/useCart'
import { useViewBagMutations } from '../../hooks/useViewBagMutations'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'
import { usePersistedModalState } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { useToast } from '@/hooks'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/images/dashpass_bg.png'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { ENV_VARS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'

export default function ViewBag() {
  const navigate = useNavigate()
  const toast = useToast()
  const { cartItems, isLoading: isLoadingCart, updateCartItem, isUpdating } = useCart()
  const { deleteCartItemMutation, deleteRecipientMutation } = useViewBagMutations()
  const { useGetCartAllRecipientsService } = usePublicCatalogQueries()
  const { data: allRecipientsData } = useGetCartAllRecipientsService()
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
    // Create a map of recipients by cart_item_id and email/phone for ID lookup (fallback)
    const recipientIdMap = new Map<string, number>()
    if (allRecipientsData?.data && Array.isArray(allRecipientsData.data)) {
      allRecipientsData.data.forEach((recipient: any) => {
        if (recipient.cart_item_id && recipient.recipient_email) {
          const key = `${recipient.cart_item_id}-${recipient.recipient_email}-${recipient.recipient_phone || ''}`
          recipientIdMap.set(key, recipient.recipient_id)
        }
      })
    }

    displayCartItems.forEach((item: FlattenedCartItem) => {
      if (item.cart_item_id && item.recipients && item.recipients.length > 0) {
        // Calculate per-recipient amount: total_amount / total_quantity
        const totalAmount = parseFloat(item.amount || '0')
        const totalQuantity = item.total_quantity || 1
        const perRecipientAmount = totalAmount / totalQuantity

        grouped[item.cart_item_id] = item.recipients.map((recipient, index) => {
          // Use recipient_id directly from cart response, with fallback to lookup map
          const lookupKey = `${item.cart_item_id}-${recipient.email}-${recipient.phone || ''}`
          const recipientId =
            recipient.recipient_id || recipient.id || recipientIdMap.get(lookupKey) || null

          return {
            id: recipientId || `${item.cart_item_id}-${index}`, // Use API ID if available, otherwise generate unique ID
            recipientId: recipientId, // Store the actual recipient ID for deletion
            name: recipient.name || recipient.email?.split('@')[0] || 'Recipient',
            email: recipient.email,
            phone: recipient.phone,
            message: recipient.message || '',
            amount: parseFloat(recipient.amount || perRecipientAmount.toString() || '0'),
            quantity: recipient.quantity || 1, // Include quantity from recipient
            cart_id: item.cart_id,
            cart_item_id: item.cart_item_id,
          }
        })
      }
    })

    return grouped
  }, [displayCartItems, allRecipientsData])

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

  // const handleEditRecipient = (item: FlattenedCartItem, recipient: any) => {
  //   if (!item.cart_item_id) {
  //     toast.error('Cart item ID is required')
  //     return
  //   }
  //   modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
  //     cart_item_id: item.cart_item_id,
  //     cardType: item.type,
  //     cardProduct: item.product,
  //     cardCurrency: item.currency || 'GHS',
  //     amount: recipient.amount,
  //   })
  // }

  const handleDeleteRecipient = (recipient: any) => {
    if (!recipient) {
      toast.error('Invalid recipient data. Cannot delete.')
      return
    }

    // Use recipientId if available (from API), otherwise try to extract from id
    const recipientId =
      recipient.recipientId || (typeof recipient.id === 'number' ? recipient.id : null)

    if (!recipientId || typeof recipientId !== 'number') {
      toast.error('Recipient ID not available. Cannot delete recipient.')
      return
    }

    setRecipientToDelete({ ...recipient, id: recipientId })
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

  // Note: PurchaseModal handles save internally via useAssignRecipientService
  // The modal state is managed via URL params through usePersistedModalState

  const handleRemoveItem = (cartId: number) => {
    deleteCartItemMutation.mutate(cartId)
  }

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // If quantity is 0 or less, remove the item
      deleteCartItemMutation.mutate(cartItemId)
      return
    }
    updateCartItem({
      cart_item_id: cartItemId,
      quantity: newQuantity,
    })
  }

  // Calculate subtotal from cart total_amount (sum of all active cart totals)
  const subtotal = useMemo(() => {
    if (!Array.isArray(activeCartItems)) return 0
    return activeCartItems.reduce((sum: number, cart: CartListResponse) => {
      const cartTotal = parseFloat(cart.total_amount || '0')
      return sum + cartTotal
    }, 0)
  }, [activeCartItems])

  // Calculate total items count (sum of item_count from all active carts)
  const totalItems = useMemo(() => {
    if (!Array.isArray(activeCartItems)) return 0
    return activeCartItems.reduce((sum: number, cart: CartListResponse) => {
      const itemCount = parseInt(cart.item_count || '0', 10)
      return sum + itemCount
    }, 0)
  }, [activeCartItems])

  // Calculate service fee (5% of subtotal, minimum 5.78)
  const serviceFee = useMemo(() => {
    const calculatedFee = subtotal * 0.05
    return Math.max(calculatedFee, 5.78)
  }, [subtotal])

  // Calculate total with service fee
  const total = useMemo(() => {
    return subtotal + serviceFee
  }, [subtotal, serviceFee])

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
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <Icon icon="bi:arrow-left" className="text-2xl" />
          <span className="text-sm font-medium">Back</span>
        </button>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MY BAG ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2">
            {displayCartItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
                <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
                <Button variant="secondary" onClick={() => navigate('/dashqards')} className="mt-6">
                  Browse Cards
                </Button>
              </div>
            ) : (
              <div
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: '0px 4px 40px 0px rgba(0, 0, 0, 0.04)' }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Name</h2>
                <div className="space-y-0">
                  {displayCartItems.map((item: FlattenedCartItem, index: number) => {
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
                    const quantity = item.total_quantity || 1

                    // Calculate total assigned quantity from recipients
                    const totalAssignedQuantity = itemRecipients.reduce(
                      (sum: number, recipient: any) => sum + (recipient.quantity || 1),
                      0,
                    )

                    return (
                      <div key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}>
                        {index > 0 && <hr className="border-gray-200 my-4" />}
                        <div className="flex items-center gap-4 py-4">
                          {/* Card Image Thumbnail */}
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
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

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-normal text-gray-900 text-base mb-1">
                              {item.product || `Card #${item.card_id}`}
                            </h3>
                            <span className="text-[#402D87] font-semibold text-base">
                              {formatCurrency(displayPrice)}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            {quantity === 1 ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleRemoveItem(item.cart_item_id || item.cart_id)
                                  }
                                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Remove item"
                                  disabled={isUpdating}
                                >
                                  <Icon icon="bi:trash" className="text-sm" />
                                </button>
                                <span className="text-gray-900 font-medium min-w-[24px] text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    if (item.cart_item_id) {
                                      handleQuantityChange(item.cart_item_id, quantity + 1)
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#402D87]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Increase quantity"
                                  disabled={isUpdating || !item.cart_item_id}
                                >
                                  {isUpdating ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                  ) : (
                                    <Icon icon="bi:plus" className="text-sm" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    if (item.cart_item_id) {
                                      handleQuantityChange(item.cart_item_id, quantity - 1)
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Decrease quantity"
                                  disabled={isUpdating || !item.cart_item_id}
                                >
                                  {isUpdating ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                  ) : (
                                    <Icon icon="bi:dash" className="text-sm" />
                                  )}
                                </button>
                                <span className="text-gray-900 font-medium min-w-[40px] text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    if (item.cart_item_id) {
                                      handleQuantityChange(item.cart_item_id, quantity + 1)
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#402D87]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Increase quantity"
                                  disabled={isUpdating || !item.cart_item_id}
                                >
                                  {isUpdating ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                  ) : (
                                    <Icon icon="bi:plus" className="text-sm" />
                                  )}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleRemoveItem(item.cart_item_id || item.cart_id)}
                              className="text-[#402D87] hover:underline text-sm font-medium ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Remove item"
                              disabled={isUpdating}
                            >
                              Remove
                            </button>
                          </div>

                          {/* Item Total Price */}
                          <div className="text-right">
                            <span className="font-bold text-gray-900 text-base">
                              {formatCurrency(displayPrice * quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Recipients Section */}
                        {hasRecipients && (
                          <div className="mt-4 ml-24 space-y-2">
                            {itemRecipients.map((recipient) => (
                              <div
                                key={recipient.id}
                                className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {recipient.name}
                                  </p>
                                  <p className="text-gray-500 text-sm truncate">
                                    {recipient.email}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                  <span className="text-gray-900 font-medium text-sm">
                                    {formatCurrency(recipient.amount)}
                                    {recipient.quantity > 1 && (
                                      <span className="text-gray-500 text-xs ml-1">
                                        (qty: {recipient.quantity})
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecipient(recipient)}
                                    className="text-red-600 hover:text-red-700 p-1"
                                    aria-label="Delete recipient"
                                  >
                                    <Icon icon="bi:trash" className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Recipient Button */}
                        {totalAssignedQuantity < quantity && (
                          <div className="mt-3 ml-24">
                            <button
                              onClick={() => handleAddRecipient(item)}
                              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <Icon icon="bi:person-plus" className="text-base" />
                              {itemRecipients.length > 0
                                ? 'Add Another Recipient'
                                : 'Assign Recipient'}
                            </button>
                          </div>
                        )}
                        {totalAssignedQuantity >= quantity && (
                          <div className="mt-3 ml-24 text-sm text-gray-500 italic">
                            Maximum recipients reached (quantity: {quantity})
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-3xl border border-gray-200 sticky top-8 p-8 flex flex-col gap-4"
              style={{ boxShadow: '0px 4px 40px 0px rgba(0, 0, 0, 0.04)' }}
            >
              {/* Progress Bar and Savings Message */}
              <div className="mb-6">
                <div className="h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#402D87] to-[#7950ed] transition-all duration-300"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
              <section className="flex flex-col gap-4">
                <Text variant="h2" weight="semibold">
                  Order Summary
                </Text>
                <div className="flex flex-col gap-2 pl-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items total</span>
                    <Text variant="h5" weight="normal">
                      {formatCurrency(subtotal)}
                    </Text>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <Text variant="h5" weight="normal">
                      {formatCurrency(serviceFee)}
                    </Text>
                  </div>
                </div>

                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <Text variant="h5" weight="semibold">
                    Subtotal
                  </Text>
                  <Text variant="h5" weight="normal">
                    {formatCurrency(total)}
                  </Text>
                </div>
              </section>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mb-4 bg-gradient-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0 rounded-full h-14 flex items-center justify-between px-6 font-medium transition-all"
              >
                <div className="flex items-center gap-2">
                  <Icon icon="hugeicons:credit-card" className="size-5 text-white" />
                  <span>Checkout</span>
                </div>
                <span className="font-bold">{formatCurrency(total)}</span>
              </button>
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
