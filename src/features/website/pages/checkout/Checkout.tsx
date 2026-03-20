import { useNavigate } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { Icon } from '@/libs'
import { Button, Loader, Modal, EmptyState, Input } from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCheckout, type CheckoutFlattenedCartItem } from '@/features/website/hooks/useCheckout'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import { CHECKOUT_GATEWAY } from '@/features/website/utils/paymentConstants'

const EGNANOW_NETWORK_OPTIONS = [
  { value: 'MTNGH', label: 'MTN' },
  { value: 'ATGH', label: 'AirtelTigo' },
  { value: 'TCELGH', label: 'Telecel' },
] as const

const KOWRI_NETWORK_OPTIONS = [
  { value: 'MTN_MONEY', label: 'MTN Money' },
  { value: 'AIRTELTIGO_MONEY', label: 'AirtelTigo Money' },
  { value: 'VODAFONE_CASH', label: 'Vodafone Cash' },
] as const

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
    paymentForm,
    paymentMethod,
    checkoutGateway,
    isPersonalDetailsCompleted,
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
    allRecipientsAssigned,
    kowriCheckoutData,
    isKowriPromptModalOpen,
    setIsKowriPromptModalOpen,
  } = useCheckout()

  const showPaymentMethodSection =
    checkoutGateway === CHECKOUT_GATEWAY.EGNANOW || checkoutGateway === CHECKOUT_GATEWAY.KOWRI
  const isEgnanow = checkoutGateway === CHECKOUT_GATEWAY.EGNANOW
  const isKowri = checkoutGateway === CHECKOUT_GATEWAY.KOWRI
  const isMobileMoney = paymentMethod?.payment_method_type === 'mobile_money'
  const isCard = paymentMethod?.payment_method_type === 'card'

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
            {!isPersonalDetailsCompleted && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                {showPaymentMethodSection && (
                  <p className="text-sm text-gray-500 mb-4">
                    Your phone number is used for mobile money payments when you select that option.
                  </p>
                )}
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
                        placeholder="024 123 4567"
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

            {showPaymentMethodSection && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment method</h3>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => paymentForm.setValue('payment_method_type', 'mobile_money')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      isMobileMoney
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => paymentForm.setValue('payment_method_type', 'card')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      isCard
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Card
                  </button>
                </div>

                {isMobileMoney && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mobile network <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name={isEgnanow ? 'paypartner_code' : 'kowri_provider'}
                        control={paymentForm.control}
                        rules={{ required: 'Please select your mobile network' }}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? (e.target.value as typeof field.value) : '',
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            aria-required
                          >
                            <option value="">Select your network</option>
                            {(isEgnanow ? EGNANOW_NETWORK_OPTIONS : KOWRI_NETWORK_OPTIONS).map(
                              (opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ),
                            )}
                          </select>
                        )}
                      />
                      {(paymentForm.formState.errors.paypartner_code?.message ||
                        paymentForm.formState.errors.kowri_provider?.message) && (
                        <p className="text-sm text-red-600">
                          {paymentForm.formState.errors.paypartner_code?.message ??
                            paymentForm.formState.errors.kowri_provider?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone number (for payment) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        {...userInfoForm.register('phone_number')}
                        error={userInfoForm.formState.errors.phone_number?.message}
                        placeholder="024 123 4567"
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {isCard && isKowri && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Icon
                        icon="bi:credit-card"
                        className="size-5 text-blue-600 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Secure card payment</p>
                        <p className="text-sm text-blue-700 mt-1">
                          You will be redirected to a secure payment page to enter your card details
                          and complete the transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isCard && isEgnanow && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Name on card
                      </label>
                      <Input
                        {...paymentForm.register('card_name')}
                        placeholder="Name as it appears on the card"
                        error={paymentForm.formState.errors.card_name?.message}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Card number
                      </label>
                      <Input
                        {...paymentForm.register('card_number')}
                        placeholder="4111 1111 1111 1111"
                        error={paymentForm.formState.errors.card_number?.message}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Expiry month
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          placeholder="MM"
                          {...paymentForm.register('expiry_month')}
                          error={paymentForm.formState.errors.expiry_month?.message}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Expiry year
                        </label>
                        <Input
                          type="number"
                          min={2020}
                          max={2040}
                          placeholder="YYYY"
                          {...paymentForm.register('expiry_year')}
                          error={paymentForm.formState.errors.expiry_year?.message}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                      <Input
                        {...paymentForm.register('cvv')}
                        placeholder="123"
                        type="password"
                        autoComplete="off"
                        error={paymentForm.formState.errors.cvv?.message}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
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

              {!allRecipientsAssigned && (
                <p className="text-sm text-amber-600 mb-3">
                  Assign recipients to all gift cards before completing your purchase.
                </p>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCheckout}
                loading={isCheckingOut}
                disabled={isCheckingOut || !allRecipientsAssigned}
              >
                {isCheckingOut ? 'Processing...' : 'Complete Purchase'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PurchaseModal />

      <Modal
        isOpen={isKowriPromptModalOpen}
        setIsOpen={setIsKowriPromptModalOpen}
        title="Payment Prompt Sent"
        panelClass="max-w-md"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            A payment prompt has been sent to your mobile money number. Please approve the request
            on your phone to complete the payment.
          </p>
          {kowriCheckoutData && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-1">
              {kowriCheckoutData.receipt_number && (
                <p>
                  <span className="font-medium">Receipt:</span> {kowriCheckoutData.receipt_number}
                </p>
              )}
              {kowriCheckoutData.merchant_order_id && (
                <p>
                  <span className="font-medium">Order ID:</span>{' '}
                  {kowriCheckoutData.merchant_order_id}
                </p>
              )}
              {kowriCheckoutData.transaction_id && (
                <p>
                  <span className="font-medium">Transaction ID:</span>{' '}
                  {kowriCheckoutData.transaction_id}
                </p>
              )}
              {kowriCheckoutData.status && (
                <p>
                  <span className="font-medium">Status:</span> {kowriCheckoutData.status}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsKowriPromptModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

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
