import type { CartListResponse } from '@/types/responses'

import { Icon } from '@/libs'
import { EmptyState, Loader, Text } from '@/components'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import { useCartModal } from '@/features/website/hooks/useCartModal'

export default function CartPopoverContent() {
  const {
    closeCart,
    navigate,
    activeCartItems,
    isLoading,
    totalItems,
    subtotal,
    updateCartItem,
    isUpdating,
    updatingItemId,
    deletingItemId,
    handleCheckout,
    handleRemoveItem,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
    canUpdateCartItemQuantity,
    canRemoveCartItem,
    isLocalGuestCartLineId,
  } = useCartModal()

  return (
    <div className="flex flex-col w-[393px] max-h-[70vh]">
      <div className="py-6 px-4 border-b border-gray-200 shrink-0 flex flex-col gap-4">
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
            {activeCartItems.flatMap((cart: CartListResponse) => {
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
                const cartStatus = cart.cart_status
                const isLocalLine = isLocalGuestCartLineId(item.cart_item_id)
                const quantityEditable = isLocalLine || canUpdateCartItemQuantity(cartStatus)
                const itemRemovable = isLocalLine || canRemoveCartItem(cartStatus)

                const handleQuantityChange = (newQuantity: number) => {
                  if (newQuantity < 1) {
                    handleRemoveItem(item.cart_item_id, cartStatus)
                    return
                  }
                  if (item.cart_item_id) {
                    updateCartItem({
                      cart_item_id: item.cart_item_id,
                      quantity: newQuantity,
                      cart_status: cartStatus,
                    })
                  } else {
                    console.warn('Cannot update quantity: cart_item_id is missing', { item, cart })
                  }
                }

                const isDeleting = deletingItemId === item.cart_item_id
                const isItemUpdating = updatingItemId === item.cart_item_id

                return (
                  <div
                    key={`${cart.cart_id}-${item.cart_item_id ?? item.card_id}`}
                    className={`flex gap-4 transition-all duration-300 ${
                      isDeleting ? 'opacity-50 pointer-events-none' : 'opacity-100'
                    }`}
                  >
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
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <Icon icon="bi:gift" className="size-3 shrink-0" />
                            <span className="text-xs font-bold tracking-wide leading-none">
                              {getCardTypeName(itemType)}
                            </span>
                          </div>
                          <span className="text-xs font-bold leading-none shrink-0">
                            {formatCurrency(totalAmount)}
                          </span>
                        </div>

                        <div className="text-[10px] font-semibold uppercase truncate">
                          {item.product}
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
                        <div
                          className={`flex items-center gap-2 border border-gray-300 rounded-lg transition-opacity ${
                            isItemUpdating ? 'opacity-70' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(quantity - 1)}
                            disabled={
                              isItemUpdating || isUpdating || quantity <= 1 || !quantityEditable
                            }
                            title={
                              !quantityEditable
                                ? 'Quantity cannot be changed for this cart'
                                : undefined
                            }
                            className="px-2 py-1 text-gray-600 hover:text-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Icon icon="bi:dash" className="size-4" />
                          </button>
                          <span className="flex h-7 min-w-8 items-center justify-center px-2">
                            {isItemUpdating ? (
                              <Icon
                                icon="mdi:loading"
                                className="size-4 animate-spin text-primary-500"
                                aria-hidden
                              />
                            ) : (
                              <span className="text-sm font-semibold text-gray-900 tabular-nums">
                                {quantity}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleQuantityChange(quantity + 1)
                            }}
                            disabled={isItemUpdating || isUpdating || !quantityEditable}
                            title={
                              !quantityEditable
                                ? 'Quantity cannot be changed for this cart'
                                : undefined
                            }
                            className="px-2 py-1 text-gray-600 hover:text-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Icon icon="bi:plus" className="size-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.cart_item_id, cartStatus)}
                          disabled={isDeleting || isItemUpdating || isUpdating || !itemRemovable}
                          className="text-red-500 hover:text-red-700 cursor-pointer transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[24px] min-h-[24px]"
                          aria-label="Remove item"
                        >
                          {isDeleting ? (
                            <Icon
                              icon="mdi:loading"
                              className="text-lg animate-spin text-red-500"
                            />
                          ) : (
                            <Icon icon="bi:trash" className="text-lg" />
                          )}
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
