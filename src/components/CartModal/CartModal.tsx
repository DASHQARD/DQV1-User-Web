import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart'
import { useCart } from '@/features/website/hooks/useCart'
import { Icon } from '@/libs'
import { Loader, Text } from '@/components'
import type { CartItemResponse } from '@/types/cart'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/Dashpass_bg.svg'
import { ENV_VARS } from '@/utils/constants'

export default function CartPopoverContent() {
  const navigate = useNavigate()
  const { closeCart } = useCartStore()
  const { cartItems, isLoading, deleteCartItem } = useCart()

  console.log('cartItems', cartItems)

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(numPrice)
  }

  const handleRemoveItem = (cartId: number) => {
    deleteCartItem(cartId)
  }

  // Construct full image URL from file_url
  const getImageUrl = (fileUrl: string | undefined) => {
    if (!fileUrl) return ''

    // If it's already a full URL, return as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl
    }

    // Construct full URL from API base URL
    // Remove /api/v1 from base URL if present, then add /uploads/ path
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
        return DashxBg // fallback
      default:
        return DashxBg
    }
  }

  // Group cart items by card_id
  type GroupedCartItem = {
    card_id: number
    cart_ids: number[] // All cart IDs in this group
    product: string
    vendor_name: string
    type: string
    currency: string
    price: string
    images: CartItemResponse['images']
    totalQuantity: number
    totalAmount: number
    item: CartItemResponse // Keep reference to first item for other properties
  }

  const groupedCartItems = (() => {
    if (!Array.isArray(cartItems)) return []

    const grouped = new Map<number, GroupedCartItem>()

    cartItems.forEach((item: CartItemResponse) => {
      const cardId = item.card_id
      const quantity = parseInt(item.recipient_count || '1', 10)
      const amount = parseFloat(item.amount)

      if (grouped.has(cardId)) {
        const existing = grouped.get(cardId)!
        existing.cart_ids.push(item.cart_id)
        existing.totalQuantity += quantity
        existing.totalAmount += amount
      } else {
        grouped.set(cardId, {
          card_id: cardId,
          cart_ids: [item.cart_id],
          product: item.product,
          vendor_name: item.vendor_name,
          type: item.type,
          currency: item.currency,
          price: item.price,
          images: item.images,
          totalQuantity: quantity,
          totalAmount: amount,
          item: item,
        })
      }
    })

    return Array.from(grouped.values())
  })()

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total: number, item: CartItemResponse) => {
        return total + parseFloat(item.amount)
      }, 0)
    : 0

  const totalItems = Array.isArray(cartItems) ? cartItems.length : 0

  return (
    <div className="flex flex-col w-[393px] max-h-[70vh]">
      <div className="py-6 px-4 border-b border-gray-200 shrink-0 flex flex-col gap-4">
        {/* <h2 className="text-2xl font-bold text-gray-900">Add to Cart</h2> */}
        <p className="text-xs">
          Subtotal: <span className="font-bold">{formatPrice(subtotal)}</span>
        </p>

        {groupedCartItems.length > 0 && (
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                closeCart()
                navigate('/view-bag')
              }}
              className="w-full rounded-full border-2 h-11 border-primary-500 bg-white text-nowrap px-6 py-3 text-sm font-bold text-primary-500 transition-all duration-200 hover:bg-primary-50"
            >
              View Bag ({totalItems})
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-full bg-primary-500 text-nowrap px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-primary-700 hover:-translate-y-0.5"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader />
            <p className="text-gray-600 text-sm mt-4">Loading cart...</p>
          </div>
        ) : groupedCartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
            <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedCartItems.map((groupedItem) => {
              const cardBackground = getCardBackground(groupedItem.type)
              const cardImageUrl = groupedItem.images?.[0]?.file_url
                ? getImageUrl(groupedItem.images[0].file_url)
                : null

              return (
                <div key={groupedItem.card_id} className="flex gap-4">
                  <div className="max-w-[210px] w-full h-[125px] shrink-0 rounded-lg overflow-hidden  relative">
                    {/* Card Background - always shown as fallback */}
                    <img
                      src={cardBackground}
                      alt={`${groupedItem.type} card background`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Uploaded Image - shown if available, falls back to background on error */}
                    {cardImageUrl && (
                      <img
                        src={cardImageUrl}
                        alt={`${groupedItem.product || groupedItem.type} card image`}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // Hide uploaded image if it fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-gray-900 text-sm  line-clamp-1">
                        {groupedItem.vendor_name}: {groupedItem.product}
                      </p>
                      <Text variant="p" weight="bold" className="text-primary-500">
                        {groupedItem.currency} {groupedItem.totalAmount.toFixed(2)}
                      </Text>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            if (groupedItem.totalQuantity > 1) {
                              // TODO: Implement quantity decrease API call
                              // For now, remove one cart item from the group
                              // Remove the first cart_id in the group
                              if (groupedItem.cart_ids.length > 0) {
                                handleRemoveItem(groupedItem.cart_ids[0])
                              }
                            } else {
                              // If quantity is 1, remove all items in the group
                              groupedItem.cart_ids.forEach((cartId) => {
                                handleRemoveItem(cartId)
                              })
                            }
                          }}
                          className="p-2 hover:bg-gray-50 rounded-l-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Icon icon="bi:dash-lg" className="text-lg text-gray-600" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700 min-w-8 text-center">
                          {groupedItem.totalQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            // TODO: Implement quantity increase API call
                            // For now, this is just UI
                          }}
                          className="p-2 hover:bg-gray-50 rounded-r-full transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Icon icon="bi:plus" className="text-lg text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
