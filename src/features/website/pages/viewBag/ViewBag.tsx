import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { AccountBenefitsPanel, Button, Loader, Text, Modal } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import { useViewBag } from '@/features/website/hooks/useViewBag'
import { useAuthStore } from '@/stores'
import { MemberOnboardingRecipientBlock } from '@/features/website/components/MemberOnboardingRecipientBlock'
import { formatCurrency } from '@/utils/format'
import type { FlattenedCartItem } from '@/types'
import { getCartRecipientDisplayLines } from '@/features/website/utils/cartRecipientUnits'

const BAG_CARD_CLASS = 'flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 sm:p-8'
const BAG_CARD_SHADOW = { boxShadow: '0px 4px 40px 0px rgba(0, 0, 0, 0.04)' }

function groupViewBagLines(items: FlattenedCartItem[]): FlattenedCartItem[][] {
  const groups: FlattenedCartItem[][] = []
  const indexByKey = new Map<string, number>()

  for (const item of items) {
    const key = String(item.cart_item_id ?? `${item.cart_id}-${item.card_id}`)
    const existing = indexByKey.get(key)
    if (existing === undefined) {
      indexByKey.set(key, groups.length)
      groups.push([item])
    } else {
      groups[existing].push(item)
    }
  }
  return groups
}

export default function ViewBag() {
  const navigate = useNavigate()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const showAccountBenefits = !isAuthenticated || isGuestAuth
  const {
    isGuestCart,
    isLoading,
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
    getCardTypeName,
    getImageUrl,
    deleteRecipientMutation,
    recipientActionsBlocked,
    canUpdateCartItemQuantity,
    canRemoveCartItem,
    hasFailedCheckoutCart,
    checkoutCtaLabel,
  } = useViewBag()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  const hasItems = displayCartItems.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-6 pb-24 sm:py-8 sm:pb-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <Icon icon="bi:arrow-left" className="text-2xl" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
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
            ) : (
              <div className="space-y-4">
                {isGuestCart || recipientActionsBlocked || hasFailedCheckoutCart ? (
                  <div className={BAG_CARD_CLASS} style={BAG_CARD_SHADOW}>
                    {isGuestCart ? (
                      <p className="text-sm text-gray-600">
                        Your bag is saved on this device. Custom cards are created when you sync at
                        checkout — verify your phone then to complete your purchase.
                      </p>
                    ) : null}
                    {recipientActionsBlocked ? <MemberOnboardingRecipientBlock /> : null}
                    {hasFailedCheckoutCart ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Your last payment attempt did not complete. You can retry checkout without
                        rebuilding your bag.
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {groupViewBagLines(displayCartItems).map((group) => {
                  const item = group[0]
                  const cardBackground = getCardBackground(item.type || '')
                  const cardImageUrl = item.images?.[0]?.file_url
                    ? getImageUrl(item.images[0].file_url)
                    : null
                  const quantity = item.total_quantity || group.length || 1
                  const lineTotal = parseFloat(item.amount || '0')
                  const unitAmount = quantity > 0 ? lineTotal / quantity : lineTotal
                  const cartStatus = item.cart_status
                  const quantityEditable = isGuestCart || canUpdateCartItemQuantity(cartStatus)
                  const itemRemovable = isGuestCart || canRemoveCartItem(cartStatus)

                  let assignedCount = 0
                  for (let unitIndex = 0; unitIndex < quantity; unitIndex++) {
                    const unitKey =
                      item.cart_item_id != null ? `${item.cart_item_id}-${unitIndex}` : ''
                    if (unitKey && (recipientsByCartItem[unitKey] ?? []).length > 0) {
                      assignedCount++
                    }
                  }

                  const handleDecreaseQuantity = () => {
                    if (quantity === 1) {
                      handleRemoveItem(item.cart_item_id || item.cart_id, cartStatus)
                      return
                    }
                    if (item.cart_item_id) {
                      handleQuantityChange(item.cart_item_id, quantity - 1, cartStatus)
                    }
                  }

                  return (
                    <div
                      key={`${item.cart_id}-${item.cart_item_id || item.card_id}`}
                      className={BAG_CARD_CLASS}
                      style={BAG_CARD_SHADOW}
                    >
                      <div className="flex gap-4">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-16 sm:w-24 sm:rounded-md">
                          <img
                            src={cardBackground}
                            alt={`${item.type} card background`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          {cardImageUrl ? (
                            <img
                              src={cardImageUrl}
                              alt={item.product || 'Cart item'}
                              className="absolute inset-0 h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-snug text-gray-900">
                              {item.product || `Card #${item.card_id}`}
                            </h3>
                            <div className="shrink-0 text-right">
                              <p className="text-base font-semibold text-[#402D87]">
                                {formatCurrency(lineTotal)}
                              </p>
                              {quantity > 1 ? (
                                <p className="text-xs text-gray-500">
                                  {formatCurrency(unitAmount)} each
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              {getCardTypeName(item.type || '')}
                            </span>
                            {assignedCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                <Icon icon="bi:check-circle" className="size-3" />
                                {assignedCount} of {quantity} Recipient
                                {quantity !== 1 ? 's' : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDecreaseQuantity}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                            disabled={
                              isUpdating ||
                              (quantity > 1 && (!item.cart_item_id || !quantityEditable)) ||
                              (quantity === 1 && !itemRemovable)
                            }
                          >
                            {isUpdating ? (
                              <Icon icon="mdi:loading" className="animate-spin text-sm" />
                            ) : (
                              <Icon icon="bi:dash" className="text-sm" />
                            )}
                          </button>
                          <span className="min-w-[28px] text-center text-sm font-semibold text-gray-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              item.cart_item_id &&
                              handleQuantityChange(item.cart_item_id, quantity + 1, cartStatus)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#402D87] text-white hover:bg-[#402D87]/90 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Increase quantity"
                            disabled={isUpdating || !item.cart_item_id || !quantityEditable}
                          >
                            {isUpdating ? (
                              <Icon icon="mdi:loading" className="animate-spin text-sm" />
                            ) : (
                              <Icon icon="bi:plus" className="text-sm" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveItem(item.cart_item_id || item.cart_id, cartStatus)
                          }
                          className="text-sm font-medium text-[#402D87] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Remove item"
                          disabled={isUpdating || !itemRemovable}
                        >
                          Remove
                        </button>
                      </div>

                      <hr className="border-gray-200" />

                      <div className="flex flex-col gap-3">
                        <Text variant="h3" weight="semibold" className="text-gray-900">
                          Recipients
                        </Text>
                        {Array.from({ length: quantity }, (_, unitIndex) => {
                          const unitKey =
                            item.cart_item_id != null ? `${item.cart_item_id}-${unitIndex}` : ''
                          const unitRecipients = unitKey
                            ? (recipientsByCartItem[unitKey] ?? [])
                            : []
                          const unitItem: FlattenedCartItem = {
                            ...item,
                            quantity_index: unitIndex,
                            amount: String(unitAmount),
                          }

                          if (unitRecipients.length === 0) {
                            return (
                              <div key={`unit-${unitIndex}-empty`} className="flex flex-col gap-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {quantity > 1 ? `Gift ${unitIndex + 1}` : 'Recipient'}
                                  </span>
                                  <span className="text-gray-400">Not assigned</span>
                                </div>
                                <Button
                                  onClick={() => handleAddRecipient(unitItem)}
                                  variant="outline"
                                  size="small"
                                  className="w-full"
                                  disabled={recipientActionsBlocked}
                                  title={
                                    recipientActionsBlocked
                                      ? 'Complete onboarding in your dashboard first'
                                      : undefined
                                  }
                                >
                                  <Icon icon="bi:person-plus" className="mr-1.5" />
                                  Assign Recipient
                                </Button>
                                {unitIndex < quantity - 1 ? (
                                  <hr className="border-gray-200" />
                                ) : null}
                              </div>
                            )
                          }

                          return unitRecipients.map((recipient: Record<string, unknown>) => {
                            const display = getCartRecipientDisplayLines(recipient)
                            const recipientAmount = Number(
                              recipient.amount ?? recipient.recipient_amount ?? 0,
                            )

                            return (
                              <div
                                key={String(
                                  recipient.id ??
                                    recipient.recipient_id ??
                                    recipient.recipientId ??
                                    `${item.cart_item_id}-${unitIndex}-${display.primary}`,
                                )}
                                className="flex flex-col gap-2"
                              >
                                {quantity > 1 ? (
                                  <span className="text-sm text-gray-600">
                                    Gift {unitIndex + 1}
                                  </span>
                                ) : null}
                                <div className="flex items-start justify-between gap-3 text-sm">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900">{display.primary}</p>
                                    {display.secondary ? (
                                      <p className="mt-0.5 text-gray-500 [overflow-wrap:anywhere]">
                                        {display.secondary}
                                      </p>
                                    ) : null}
                                  </div>
                                  <span className="shrink-0 font-medium text-gray-900">
                                    {formatCurrency(recipientAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleEditRecipient(unitItem, recipient)}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#402D87] hover:underline"
                                    aria-label="Edit recipient"
                                  >
                                    <Icon icon="bi:pencil" className="text-sm" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteRecipient(recipient, String(item.cart_item_id))
                                    }
                                    className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline"
                                    aria-label="Delete recipient"
                                  >
                                    <Icon icon="bi:trash" className="text-sm" />
                                    Remove
                                  </button>
                                </div>
                                {unitIndex < quantity - 1 ? (
                                  <hr className="border-gray-200" />
                                ) : null}
                              </div>
                            )
                          })
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${BAG_CARD_CLASS} lg:sticky lg:top-8`} style={BAG_CARD_SHADOW}>
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
                    Total
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
                  <span>{checkoutCtaLabel}</span>
                </div>
                <span className="font-bold">{formatCurrency(total)}</span>
              </button>
            </div>

            {showAccountBenefits && hasItems ? (
              <>
                <div className="lg:hidden mt-4">
                  <AccountBenefitsPanel variant="banner" showGuestCheckoutNote />
                </div>
                <div className="hidden lg:block mt-4">
                  <AccountBenefitsPanel variant="sidebar" showGuestCheckoutNote />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

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
    </div>
  )
}
