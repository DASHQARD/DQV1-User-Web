import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/stores/cart'
import { useCart } from '@/features/website/hooks/useCart'
import { Icon } from '@/libs'
import { Loader, Text } from '@/components'
import type { CartItemResponse, CartItemImage } from '@/types/cart'
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

  // Flatten cart items from nested structure
  // cartItems is an array of carts, each cart has an items array
  type FlattenedCartItem = {
    cart_id: number
    card_id: number
    product: string
    vendor_name?: string
    type: string
    currency: string
    price: string
    amount: string
    images?: CartItemImage[]
    cart_item_id?: number
  }

  const flattenedCartItems: FlattenedCartItem[] = (() => {
    if (!Array.isArray(cartItems)) return []

    const flattened: FlattenedCartItem[] = []

    cartItems.forEach((cart: CartItemResponse) => {
      // Each cart has an items array
      if (cart.items && Array.isArray(cart.items)) {
        cart.items.forEach((item) => {
          flattened.push({
            cart_id: cart.cart_id,
            card_id: item.card_id,
            product: item.product,
            vendor_name: undefined, // May not be in nested structure
            type: item.type,
            currency: 'GHS', // Default, adjust if available
            price: item.total_amount,
            amount: item.total_amount,
            images: item.images,
            cart_item_id: item.cart_item_id,
          })
        })
      }
    })

    return flattened
  })()

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce((total: number, cart: CartItemResponse) => {
        const amount = parseFloat(cart.total_amount || '0')
        return total + amount
      }, 0)
    : 0

  const totalItems = flattenedCartItems.length

  return (
    <div className="flex flex-col w-[393px] max-h-[70vh]">
      <div className="py-6 px-4 border-b border-gray-200 shrink-0 flex flex-col gap-4">
        {/* <h2 className="text-2xl font-bold text-gray-900">Add to Cart</h2> */}
        <p className="text-xs">
          Subtotal: <span className="font-bold">{formatPrice(subtotal)}</span>
        </p>

        {flattenedCartItems.length > 0 && (
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
        ) : flattenedCartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
            <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flattenedCartItems.map((item: FlattenedCartItem) => {
              const cardBackground = getCardBackground(item.type || '')
              const cardImageUrl = item.images?.[0]?.file_url
                ? getImageUrl(item.images[0].file_url)
                : null
              const amount = parseFloat(item.amount || '0')

              return (
                <div
                  key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
                  className="flex gap-4"
                >
                  <div className="max-w-[210px] w-full h-[125px] shrink-0 rounded-lg overflow-hidden relative">
                    {/* Card Background - always shown as fallback */}
                    <img
                      src={cardBackground}
                      alt={`${item.type || 'card'} card background`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Uploaded Image - shown if available, falls back to background on error */}
                    {cardImageUrl && (
                      <img
                        src={cardImageUrl}
                        alt={`${item.product || item.type} card image`}
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
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {item.vendor_name ? `${item.vendor_name}: ${item.product}` : item.product}
                      </p>
                      <Text variant="p" weight="bold" className="text-primary-500">
                        {item.currency || 'GHS'} {amount.toFixed(2)}
                      </Text>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.cart_item_id || item.cart_id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Icon icon="bi:trash" className="text-lg" />
                      </button>
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
