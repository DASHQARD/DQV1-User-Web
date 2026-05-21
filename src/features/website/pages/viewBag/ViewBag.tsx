import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Text, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { useViewBag } from '@/features/website/hooks/useViewBag'
import { MemberOnboardingRecipientBlock } from '@/features/website/components/MemberOnboardingRecipientBlock'
import { formatCurrency } from '@/utils/format'
import type { FlattenedCartItem } from '@/types'
import type { CartItem } from '@/stores/cart'

export default function ViewBag() {
  const navigate = useNavigate()
  const {
    isGuestCart,
    isLoading,
    guestItems,
    removeGuestItem,
    updateGuestQuantity,
    displayCartItems,
    recipientsByCartItem,
    handleRemoveItem,
    handleQuantityChange,
    isUpdating,
    handleAddRecipient,
    handleEditRecipient,
    handleDeleteRecipient,
    confirmDeleteRecipient,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    recipientToDelete,
    setRecipientToDelete,
    subtotal,
    totalItems,
    serviceFee,
    total,
    getCardBackground,
    getImageUrl,
    deleteRecipientMutation,
    recipientActionsBlocked,
  } = useViewBag()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  const hasItems = isGuestCart ? guestItems.length > 0 : displayCartItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <Icon icon="bi:arrow-left" className="text-2xl" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MY BAG ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Cart Items */}
          <div className="lg:col-span-2">
            {!hasItems ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Icon icon="bi:cart-x" className="text-6xl text-gray-300 mb-4 mx-auto" />
                <p className="text-gray-600 text-lg font-medium">Your bag is empty</p>
                <p className="text-gray-500 text-sm mt-2">Add items to get started</p>
                <Button variant="secondary" onClick={() => navigate('/dashqards')} className="mt-6">
                  Browse Cards
                </Button>
              </div>
            ) : isGuestCart ? (
              /* Guest cart list */
              <div
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: '0px 4px 40px 0px rgba(0, 0, 0, 0.04)' }}
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items Name</h2>
                <div className="space-y-0">
                  {guestItems.map((item: CartItem, index: number) => {
                    const cardBackground = getCardBackground(item.type || 'dashx')
                    const displayPrice = (item.price || 0) * item.quantity
                    return (
                      <div key={item.id}>
                        {index > 0 && <hr className="border-gray-200 my-4" />}
                        <div className="flex items-center gap-4 py-4">
                          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-200 relative">
                            <img
                              src={cardBackground}
                              alt={`${item.type} card background`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-normal text-gray-900 text-base">{item.title}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                item.quantity <= 1
                                  ? removeGuestItem(item.id)
                                  : updateGuestQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                            >
                              <Icon icon="bi:dash" className="text-sm" />
                            </button>
                            <span className="text-gray-900 font-medium min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateGuestQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#402D87]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Icon icon="bi:plus" className="text-sm" />
                            </button>
                            <button
                              onClick={() => removeGuestItem(item.id)}
                              className="text-[#402D87] hover:underline text-sm font-medium ml-2"
                              aria-label="Remove item"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900 text-base">
                              {formatCurrency(displayPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Logged-in cart list (API cart with recipients) */
              <div
                className="bg-white rounded-2xl p-6"
                style={{ boxShadow: '0px 4px 40px 0px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="mb-4 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Items Name</h2>
                  {recipientActionsBlocked ? <MemberOnboardingRecipientBlock /> : null}
                </div>
                <div className="space-y-0">
                  {displayCartItems.map((item: FlattenedCartItem, index: number) => {
                    const cardBackground = getCardBackground(item.type || '')
                    const cardImageUrl = item.images?.[0]?.file_url
                      ? getImageUrl(item.images[0].file_url)
                      : null
                    const itemRecipients =
                      item.cart_item_id && recipientsByCartItem[item.cart_item_id]
                        ? recipientsByCartItem[item.cart_item_id]
                        : []
                    // `item.amount` comes from API `total_amount` — already the line total, not per-unit price
                    const lineTotal = parseFloat(item.amount || '0')
                    const hasRecipients = itemRecipients.length > 0
                    const quantity = item.total_quantity || 1
                    const totalAssignedQuantity = itemRecipients.reduce(
                      (sum: number, recipient: any) =>
                        sum + (recipient.quantity ?? recipient.recipient_quantity ?? 1),
                      0,
                    )

                    return (
                      <div key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}>
                        {index > 0 && <hr className="border-gray-200 my-4" />}
                        <div className="flex items-center gap-4 py-4">
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
                          <div className="flex-1 min-w-0">
                            <h3 className="font-normal text-gray-900 text-base">
                              {item.product || `Card #${item.card_id}`}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3">
                            {quantity === 1 ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleRemoveItem(item.cart_item_id || item.cart_id)
                                  }
                                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Remove item"
                                  disabled={isUpdating}
                                >
                                  <Icon icon="bi:trash" className="text-sm" />
                                </button>
                                <span className="text-gray-900 font-medium min-w-[24px] text-center">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    item.cart_item_id &&
                                    handleQuantityChange(item.cart_item_id, quantity + 1)
                                  }
                                  className="w-8 h-8 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#402D87]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  onClick={() =>
                                    item.cart_item_id &&
                                    handleQuantityChange(item.cart_item_id, quantity - 1)
                                  }
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                  onClick={() =>
                                    item.cart_item_id &&
                                    handleQuantityChange(item.cart_item_id, quantity + 1)
                                  }
                                  className="w-8 h-8 rounded-full bg-[#402D87] flex items-center justify-center text-white hover:bg-[#402D87]/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <div className="text-right">
                            <span className="font-bold text-gray-900 text-base">
                              {formatCurrency(lineTotal)}
                            </span>
                          </div>
                        </div>

                        {hasRecipients && (
                          <div className="mt-4 ml-24 space-y-2">
                            {itemRecipients.map((recipient: any) => (
                              <div
                                key={
                                  recipient.id ??
                                  recipient.recipient_id ??
                                  recipient.recipientId ??
                                  `${item.cart_item_id}-${recipient.email ?? recipient.recipient_email ?? ''}`
                                }
                                className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {recipient.name ?? recipient.recipient_name ?? 'Recipient'}
                                  </p>
                                  <p className="text-gray-500 text-sm truncate">
                                    {recipient.email ?? recipient.recipient_email ?? ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                  <span className="text-gray-900 font-medium text-sm">
                                    {formatCurrency(
                                      recipient.amount ?? recipient.recipient_amount ?? 0,
                                    )}
                                    {(recipient.quantity ?? recipient.recipient_quantity ?? 1) >
                                      1 && (
                                      <span className="text-gray-500 text-xs ml-1">
                                        (qty:{' '}
                                        {recipient.quantity ?? recipient.recipient_quantity ?? 1})
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleEditRecipient(item, recipient)}
                                    className="text-[#402D87] hover:text-[#402D87]/80 p-1"
                                    aria-label="Edit recipient"
                                  >
                                    <Icon icon="bi:pencil" className="text-sm" />
                                  </button>
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

                        {totalAssignedQuantity < quantity && (
                          <div className="mt-3 ml-24">
                            <button
                              type="button"
                              onClick={() => handleAddRecipient(item)}
                              disabled={recipientActionsBlocked}
                              title={
                                recipientActionsBlocked
                                  ? 'Complete onboarding in your dashboard first'
                                  : undefined
                              }
                              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={recipientActionsBlocked}
                title={
                  recipientActionsBlocked
                    ? 'Complete onboarding in your dashboard before checkout'
                    : undefined
                }
                className="w-full mb-4 bg-gradient-to-r from-[#402D87] to-[#7950ed] hover:from-[#402D87]/90 hover:to-[#7950ed]/90 text-white border-0 rounded-full h-14 flex items-center justify-between px-6 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[#402D87] disabled:hover:to-[#7950ed]"
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

      {!isGuestCart && (
        <>
          <PurchaseModal />
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
                    <p className="font-semibold text-gray-900">
                      {recipientToDelete.name || recipientToDelete.recipient_name || 'Self'}
                    </p>
                    {(recipientToDelete.email || recipientToDelete.recipient_email) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {recipientToDelete.email || recipientToDelete.recipient_email}
                      </p>
                    )}
                    {(recipientToDelete.phone || recipientToDelete.recipient_phone) && (
                      <p className="text-sm text-gray-600">
                        {recipientToDelete.phone || recipientToDelete.recipient_phone}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary-500 mt-2">
                      {formatCurrency(
                        recipientToDelete.amount ?? recipientToDelete.recipient_amount ?? 0,
                      )}
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
        </>
      )}
    </div>
  )
}
