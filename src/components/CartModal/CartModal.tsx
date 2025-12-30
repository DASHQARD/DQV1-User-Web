import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart'
import { useCart } from '@/features/website/hooks/useCart'
import { Icon } from '@/libs'
import { EmptyState, Loader, Text } from '@/components'
import type { CartListResponse } from '@/types/responses'
import DashxBg from '@/assets/svgs/Dashx_bg.svg'
import DashproBg from '@/assets/svgs/dashpro_bg.svg'
import DashpassBg from '@/assets/svgs/dashpass_bg.svg'
import { ENV_VARS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'

export default function CartPopoverContent() {
  const navigate = useNavigate()
  const { closeCart } = useCartStore()
  const { cartItems, isLoading, deleteCartItem, updateCartItem, isUpdating } = useCart()

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
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
        // If type doesn't match, try to return uppercase version of the type
        // This handles cases like 'DashX' -> 'DASHX'
        return type.toUpperCase().trim()
    }
  }

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total: number, cart: CartListResponse) => {
        const amount = parseFloat(cart.total_amount || '0')
        return total + amount
      }, 0)
    : 0

  // Calculate total items - check if cartItems is empty or has no items
  const totalItems = Array.isArray(cartItems)
    ? cartItems.reduce((total, cart) => {
        if (!cart.items) return total
        const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
        return total + itemsArray.length
      }, 0)
    : 0

  return (
    <div className="flex flex-col w-[393px] max-h-[70vh]">
      <div className="py-6 px-4 border-b border-gray-200 shrink-0 flex flex-col gap-4">
        {/* <h2 className="text-2xl font-bold text-gray-900">Add to Cart</h2> */}
        <p className="text-xs">
          Subtotal: <span className="font-bold">{formatCurrency(subtotal)}</span>
        </p>

        {totalItems > 0 && (
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
        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <EmptyState
              image={EmptyStateImage}
              title="Your bag is empty"
              description="Add items to get started"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.flatMap((cart: CartListResponse) => {
              if (!cart.items) return []

              // Handle both array and single object cases
              const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]

              return itemsArray.map((item: any) => {
                // Try to get type from item, or fallback to a default
                // The type might be undefined in the API response
                const itemType = item.type || item.card_type || 'dashx'
                const cardBackground = getCardBackground(itemType)
                const cardImageUrl = item.images?.[0]?.file_url
                  ? getImageUrl(item.images[0].file_url)
                  : null
                // Use cart's total_amount if item's total_amount is 0 or missing
                const itemTotalAmount = parseFloat(item.total_amount || '0')
                const cartTotalAmount = parseFloat(cart.total_amount || '0')
                const totalAmount = itemTotalAmount > 0 ? itemTotalAmount : cartTotalAmount
                const quantity = item.total_quantity || 1
                // Calculate unit price from total amount and quantity
                const unitPrice = quantity > 0 ? totalAmount / quantity : totalAmount

                const handleQuantityChange = (newQuantity: number) => {
                  if (newQuantity < 1) {
                    handleRemoveItem(item.cart_item_id)
                    return
                  }
                  if (item.cart_item_id) {
                    // amount should be the unit price (per item), not total
                    console.log('Updating cart item:', {
                      cart_item_id: item.cart_item_id,
                      quantity: newQuantity,
                      amount: unitPrice,
                    })
                    updateCartItem({
                      cart_item_id: item.cart_item_id,
                      quantity: newQuantity,
                      amount: unitPrice,
                    })
                  } else {
                    console.warn('Cannot update quantity: cart_item_id is missing', { item, cart })
                  }
                }

                // Generate QR code for the card
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`${item.product}-${item.card_id}`)}&bgcolor=FFFFFF&color=000000&margin=0`

                return (
                  <div key={`${cart.cart_id}-${item.card_id}`} className="flex gap-4">
                    <div className="max-w-[210px] w-full h-[125px] shrink-0 rounded-lg overflow-hidden relative">
                      {/* Card Background - always shown as fallback */}
                      <img
                        src={cardBackground}
                        alt={`${itemType || 'card'} card background`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Uploaded Image - shown if available, falls back to background on error */}
                      {cardImageUrl && (
                        <img
                          src={cardImageUrl}
                          alt={`${item.product || itemType} card image`}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            // Hide uploaded image if it fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      )}

                      {/* Card Overlay Content */}
                      <div className="absolute inset-0 p-2 flex flex-col justify-between text-white pointer-events-none">
                        {/* Top Section */}
                        <div className="flex items-start justify-between">
                          {/* Left: Card Type */}
                          <div className="flex items-center gap-1">
                            <Icon icon="bi:gift" className="size-3" />
                            <span className="text-xs font-bold tracking-wide">
                              {getCardTypeName(itemType)}
                            </span>
                          </div>
                          {/* Right: Price */}
                          <div className="text-right">
                            <span className="text-xs font-bold">{formatCurrency(totalAmount)}</span>
                          </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex items-end justify-between">
                          {/* Left: Product Name */}
                          <div className="text-[10px] font-semibold uppercase truncate max-w-[60%]">
                            {item.product}
                          </div>
                          {/* Right: QR Code */}
                          <div className="p-1 rounded bg-white/10 backdrop-blur-sm">
                            <img src={qrCodeUrl} alt="QR Code" className="w-8 h-8" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {item.product}
                        </p>
                        <Text variant="p" weight="bold" className="text-primary-500">
                          {formatCurrency(totalAmount)}
                        </Text>
                      </div>

                      <div className="flex flex-col items-center justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={isUpdating || quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Icon icon="bi:dash" className="size-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-semibold text-gray-900 min-w-8 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Increase clicked', {
                                cart_item_id: item.cart_item_id,
                                quantity,
                                unitPrice,
                              })
                              handleQuantityChange(quantity + 1)
                            }}
                            disabled={isUpdating}
                            className="px-2 py-1 text-gray-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Icon icon="bi:plus" className="size-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.cart_item_id)}
                          className="text-red-500 hover:text-red-500 transition-colors ml-auto"
                          aria-label="Remove item"
                        >
                          <Icon icon="bi:trash" className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            })}
          </div>
        )}
      </div>
    </div>
  )
}
