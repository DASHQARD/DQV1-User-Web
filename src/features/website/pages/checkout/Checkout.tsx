import { useNavigate } from 'react-router-dom'
import { Icon } from '@/libs'
import { Button, Loader, Modal, EmptyState, Input } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCheckout, type CheckoutFlattenedCartItem } from '@/features/website/hooks/useCheckout'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'

export default function Checkout() {
  const navigate = useNavigate()
  const {
    isLoadingCart,
    pendingCartItems,
    displayCartItems,
    totalAmount,
    serviceFee,
    amountDue,
    userInfoForm,
    isUserInfoIncomplete,
    recipientsByCartItem,
    itemsMissingRecipients,
    handleCheckout,
    bulkAssignMutation,
    handleBulkUpload,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
    openAssignModal,
    openAssignModalFromMissing,
    isCheckingOut,
    isBulkModalOpen,
    setIsBulkModalOpen,
    isMissingRecipientsModalOpen,
    setIsMissingRecipientsModalOpen,
    bulkFile,
    setBulkFile,
  } = useCheckout()

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (
    !Array.isArray(pendingCartItems) ||
    pendingCartItems.length === 0 ||
    displayCartItems.length === 0
  ) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <EmptyState
            image={EmptyStateImage}
            title="Your cart is empty"
            description="Add items to your cart to proceed to checkout"
          />
          <Button
            onClick={() => navigate('/dashqards')}
            className="mt-6 mx-auto"
            variant="secondary"
          >
            Browse Gift Cards
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="wrapper py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {isUserInfoIncomplete && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <form onSubmit={userInfoForm.handleSubmit(() => {})} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        {...userInfoForm.register('full_name')}
                        error={userInfoForm.formState.errors.full_name?.message}
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        {...userInfoForm.register('phone_number')}
                        error={userInfoForm.formState.errors.phone_number?.message}
                        placeholder="+233 XX XXX XXXX"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      {...userInfoForm.register('email')}
                      error={userInfoForm.formState.errors.email?.message}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {displayCartItems
                  ?.filter((item: CheckoutFlattenedCartItem) => item.cart_item_id)
                  .map((item: CheckoutFlattenedCartItem) => {
                    const cardBackground = getCardBackground(item.type || '')
                    const displayPrice = parseFloat(item.amount || '0')
                    const key = item.cart_item_id
                      ? `${item.cart_item_id}-${item.quantity_index ?? 0}`
                      : ''
                    const itemRecipients =
                      key && recipientsByCartItem[key] ? recipientsByCartItem[key] : []
                    const hasRecipients = itemRecipients.length > 0
                    const cardImageUrl = item.images?.[0]?.file_url
                      ? getImageUrl(item.images[0].file_url)
                      : null

                    return (
                      <div
                        key={`${item.cart_id}-${item.cart_item_id || item.card_id}-${item.quantity_index ?? 0}`}
                        className="p-6"
                      >
                        <div className="flex gap-4">
                          <div className="w-24 h-16 shrink-0 rounded-md overflow-hidden bg-gray-200 relative">
                            <img
                              src={cardBackground}
                              alt={`${item.type} card background`}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {cardImageUrl && (
                              <img
                                src={cardImageUrl}
                                alt={item.product || 'Cart item'}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-1">
                                  {item.product || `Card #${item.card_id}`}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <span>{getCardTypeName(item.type)}</span>
                                </div>
                                {hasRecipients && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    <Icon icon="bi:check-circle" className="size-3" />
                                    {itemRecipients.length} Recipient
                                    {itemRecipients.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-base font-semibold text-gray-900">
                                  {formatCurrency(displayPrice)}
                                </p>
                              </div>
                            </div>
                            {itemRecipients.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="space-y-2">
                                  {itemRecipients.map((recipient) => (
                                    <div
                                      key={recipient.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                          {recipient.name}
                                        </p>
                                        <p className="text-gray-500 truncate">{recipient.email}</p>
                                      </div>
                                      <span className="ml-4 text-gray-600 font-medium">
                                        {formatCurrency(recipient.amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-4">
                              {itemRecipients.length < (item.total_quantity || 1) && (
                                <Button
                                  onClick={() => openAssignModal(item)}
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
                  })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({displayCartItems.length} items)</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-gray-900">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountDue)}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCheckout}
                loading={isCheckingOut}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal />

      <Modal
        isOpen={isBulkModalOpen}
        setIsOpen={setIsBulkModalOpen}
        title="Bulk Assign Recipients"
        panelClass="max-w-2xl"
      >
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            Upload a file containing recipient information. The file should be in CSV or Excel
            format with columns: name, email, phone, message, quantity, amount.
          </p>
          <FileUploader
            label="Upload Recipients File"
            accept=".csv,.xlsx,.xls"
            value={bulkFile}
            onChange={setBulkFile}
          />
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkModalOpen(false)
                setBulkFile(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleBulkUpload}
              disabled={!bulkFile || bulkAssignMutation.isPending}
              loading={bulkAssignMutation.isPending}
            >
              Upload & Assign
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isMissingRecipientsModalOpen}
        setIsOpen={setIsMissingRecipientsModalOpen}
        title="Recipients Required"
        panelClass="max-w-2xl"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Icon icon="bi:exclamation-triangle" className="size-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Assign Recipients Before Checkout
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please assign recipients to all gift cards before proceeding to checkout. The
                following items still need recipients:
              </p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {itemsMissingRecipients.map((item: CheckoutFlattenedCartItem) => {
                  const key = item.cart_item_id
                    ? `${item.cart_item_id}-${item.quantity_index ?? 0}`
                    : ''
                  const itemRecipients = key ? recipientsByCartItem[key] || [] : []
                  const requiredQuantity = item.total_quantity || 1
                  return (
                    <div key={item.cart_item_id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {item.product || `Card #${item.card_id}`}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            {getCardTypeName(item.type)} • Quantity: {requiredQuantity}
                          </p>
                          <div className="flex items-center gap-2">
                            {itemRecipients.length > 0 ? (
                              <span className="text-xs text-green-600 font-medium">
                                {itemRecipients.length} of {requiredQuantity} assigned
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 font-medium">
                                No recipients assigned
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => openAssignModalFromMissing(item)}
                        >
                          <Icon icon="bi:person-plus" className="mr-1.5" />
                          {itemRecipients.length > 0 ? 'Add Recipients' : 'Assign Recipients'}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setIsMissingRecipientsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
