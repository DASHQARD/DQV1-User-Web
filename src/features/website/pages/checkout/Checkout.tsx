import React, { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Controller } from 'react-hook-form'
import { Icon } from '@/libs'
import { CheckoutSection } from './CheckoutSection'
import { CheckoutFlowProgress, type CheckoutFlowStep } from './CheckoutFlowProgress'
import {
  AccountBenefitsPanel,
  Button,
  Loader,
  Modal,
  EmptyState,
  Input,
  BasePhoneInput,
} from '@/components'
import PurchaseModal from '@/components/PurchaseModal/PurchaseModal'
import FileUploader from '@/components/FileUploader/FileUploader'
import { useCheckout, type CheckoutFlattenedCartItem } from '@/features/website/hooks/useCheckout'
import { MemberOnboardingRecipientBlock } from '@/features/website/components/MemberOnboardingRecipientBlock'
import { formatCurrency } from '@/utils/format'
import { EmptyStateImage } from '@/assets/images'
import { CHECKOUT_GATEWAY } from '@/features/website/utils/paymentConstants'
import { EXAMPLE_PHONE_LOCAL, ROUTES } from '@/utils/constants'
import { GuestCartDebugPanel } from './GuestCartDebugPanel'

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

const MTN_PREFIXES = new Set(['024', '025', '053', '054', '055', '059'])

const AIRTELTIGO_PREFIXES = new Set(['026', '027', '056', '057'])

const TELECEL_PREFIXES = new Set(['020', '050'])

function normalizeGhanaPhonePrefix(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length >= 10 && digitsOnly.startsWith('0')) {
    return digitsOnly.slice(0, 3)
  }

  if (digitsOnly.startsWith('233') && digitsOnly.length >= 12) {
    return `0${digitsOnly.slice(3, 5)}`
  }

  return ''
}

function detectNetworkFromPhone(phone: string): 'mtn' | 'airteltigo' | 'telecel' | null {
  const prefix = normalizeGhanaPhonePrefix(phone)
  if (!prefix) return null

  if (MTN_PREFIXES.has(prefix)) return 'mtn'
  if (AIRTELTIGO_PREFIXES.has(prefix)) return 'airteltigo'
  if (TELECEL_PREFIXES.has(prefix)) return 'telecel'

  return null
}

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showGuestCartDebug = import.meta.env.DEV && searchParams.has('debugGuestCart')
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
    isGuestCheckoutFlow,
    guestBagReady,
    guestRequiresAccountMessage,
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
    isUserInfoIncomplete,
    senderStepComplete,
    guestCanAssignRecipients,
    recipientActionsBlocked,
    paymentPromptData,
    isPaymentPromptModalOpen,
    setIsPaymentPromptModalOpen,
    hasFailedCheckoutCart,
  } = useCheckout()

  const showPaymentMethodSection =
    checkoutGateway === CHECKOUT_GATEWAY.EGNANOW || checkoutGateway === CHECKOUT_GATEWAY.KOWRI
  const isEgnanow = checkoutGateway === CHECKOUT_GATEWAY.EGNANOW
  const isKowri = checkoutGateway === CHECKOUT_GATEWAY.KOWRI
  const isMobileMoney = paymentMethod?.payment_method_type === 'mobile_money'
  const isCard = paymentMethod?.payment_method_type === 'card'

  const phoneNumber = userInfoForm.watch('phone_number')

  React.useEffect(() => {
    if (!showPaymentMethodSection || !isMobileMoney) return

    const detectedNetwork = detectNetworkFromPhone(phoneNumber ?? '')
    if (!detectedNetwork) return

    if (isEgnanow) {
      const mappedProvider =
        detectedNetwork === 'mtn' ? 'MTNGH' : detectedNetwork === 'airteltigo' ? 'ATGH' : 'TCELGH'

      if (paymentForm.getValues('paypartner_code') !== mappedProvider) {
        paymentForm.setValue('paypartner_code', mappedProvider, { shouldValidate: true })
      }
      return
    }

    if (isKowri) {
      const mappedProvider =
        detectedNetwork === 'mtn'
          ? 'MTN_MONEY'
          : detectedNetwork === 'airteltigo'
            ? 'AIRTELTIGO_MONEY'
            : 'VODAFONE_CASH'

      if (paymentForm.getValues('kowri_provider') !== mappedProvider) {
        paymentForm.setValue('kowri_provider', mappedProvider, { shouldValidate: true })
      }
    }
  }, [isEgnanow, isKowri, isMobileMoney, paymentForm, phoneNumber, showPaymentMethodSection])

  const recipientsStepComplete = isGuestCheckoutFlow
    ? allRecipientsAssigned && guestBagReady
    : allRecipientsAssigned && senderStepComplete
  const canProceedToPayment = isGuestCheckoutFlow
    ? guestBagReady && allRecipientsAssigned && !recipientActionsBlocked
    : recipientsStepComplete && senderStepComplete && !recipientActionsBlocked

  const checkoutFlowSteps = useMemo((): CheckoutFlowStep[] => {
    if (isGuestCheckoutFlow) {
      const recipientsStatus: CheckoutFlowStep['status'] = allRecipientsAssigned
        ? 'complete'
        : 'current'
      const paymentStatus: CheckoutFlowStep['status'] = canProceedToPayment ? 'current' : 'upcoming'

      return [
        { id: 'recipients', label: 'Recipient details', status: recipientsStatus },
        { id: 'payment', label: 'Payment', status: paymentStatus },
      ]
    }

    const senderStatus: CheckoutFlowStep['status'] = isUserInfoIncomplete ? 'current' : 'complete'
    const recipientsStatus: CheckoutFlowStep['status'] = senderStepComplete
      ? allRecipientsAssigned
        ? 'complete'
        : 'current'
      : 'upcoming'
    const reviewStatus: CheckoutFlowStep['status'] = canProceedToPayment
      ? 'current'
      : recipientsStepComplete
        ? 'current'
        : 'upcoming'

    return [
      { id: 'sender', label: 'Sender details', status: senderStatus },
      { id: 'recipients', label: 'Recipient details', status: recipientsStatus },
      { id: 'review', label: 'Review order', status: reviewStatus },
      { id: 'payment', label: 'Payment', status: canProceedToPayment ? 'current' : 'upcoming' },
    ]
  }, [
    isGuestCheckoutFlow,
    allRecipientsAssigned,
    isUserInfoIncomplete,
    senderStepComplete,
    recipientsStepComplete,
    canProceedToPayment,
  ])

  const checkoutFlowHint = useMemo(() => {
    if (recipientActionsBlocked) {
      return 'Complete onboarding in your dashboard before you can assign recipients or pay.'
    }
    if (isGuestCheckoutFlow && !allRecipientsAssigned) {
      return 'Assign a recipient to each gift card. Use Assign to Self when the gift is for you.'
    }
    if (isGuestCheckoutFlow && isUserInfoIncomplete) {
      return 'Enter your name and phone in the payment step, then complete your purchase.'
    }
    if (!allRecipientsAssigned) {
      return 'Assign a recipient to each gift card. Use Assign to Self when the gift is for you.'
    }
    if (!canProceedToPayment) {
      return 'Complete recipient and sender details, then review your order and pay.'
    }
    return 'Review your order summary, then complete payment.'
  }, [
    recipientActionsBlocked,
    isUserInfoIncomplete,
    isGuestCheckoutFlow,
    allRecipientsAssigned,
    canProceedToPayment,
  ])

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  const hasCheckoutItems =
    Array.isArray(pendingCartItems) && pendingCartItems.length > 0

  if (!hasCheckoutItems || displayCartItems.length === 0) {
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
        <div className="mb-6 space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">
            {isGuestCheckoutFlow
              ? 'Enter your details, assign recipients, then pay — no account required.'
              : 'Sender details, recipient assignment, order review, then payment — in that order.'}
          </p>
          <CheckoutFlowProgress steps={checkoutFlowSteps} />
          <p className="text-sm text-gray-600">{checkoutFlowHint}</p>
          {hasFailedCheckoutCart ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your previous payment did not go through. Complete the steps below and try again —
              your cart is still saved.
            </div>
          ) : null}
        </div>

        {isGuestCheckoutFlow ? (
          <div className="mb-6 lg:hidden">
            <AccountBenefitsPanel variant="banner" showGuestCheckoutNote />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {!recipientActionsBlocked && !isGuestCheckoutFlow && (
              <CheckoutSection
                step={1}
                title="Sender details"
                subtitle="Your name, phone, and email for receipts and gift delivery updates — separate from who receives each card."
              >
                {showPaymentMethodSection && (
                  <p className="text-sm text-gray-500 mb-4">
                    Your phone number is also used for mobile money when you choose that payment option.
                  </p>
                )}
                <form onSubmit={userInfoForm.handleSubmit(() => {})} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        First name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        {...userInfoForm.register('first_name')}
                        error={userInfoForm.formState.errors.first_name?.message}
                        placeholder="John"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        {...userInfoForm.register('last_name')}
                        error={userInfoForm.formState.errors.last_name?.message}
                        placeholder="Doe"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="phone_number"
                        control={userInfoForm.control}
                        render={({ field: { value, onChange, onBlur, ref } }) => (
                          <BasePhoneInput
                            ref={ref}
                            selectedVal={value || ''}
                            handleChange={onChange}
                            onBlur={onBlur}
                            error={
                              userInfoForm.formState.touchedFields.phone_number
                                ? userInfoForm.formState.errors.phone_number?.message
                                : undefined
                            }
                            placeholder={EXAMPLE_PHONE_LOCAL}
                          />
                        )}
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
              </CheckoutSection>
            )}

            <CheckoutSection
              step={isGuestCheckoutFlow ? 1 : 2}
              title="Recipient details"
              subtitle="Who receives each gift card. Use Assign to Self when you are the recipient."
            >
              {recipientActionsBlocked ? (
                <MemberOnboardingRecipientBlock />
              ) : (
                <>
              <div className="mb-4 flex gap-3 rounded-lg border border-primary-100 bg-primary-50/60 p-4">
                <Icon icon="bi:person-check" className="mt-0.5 size-5 shrink-0 text-primary-600" />
                <div className="text-sm text-primary-900">
                  <p className="font-medium">Assign to Self</p>
                  <p className="mt-1 text-primary-800">
                    When you tap Assign Recipient, turn on <strong>Assign to Self</strong> if the
                    gift is for you
                    {isGuestCheckoutFlow
                      ? ' — your name and phone are filled in automatically when you pay'
                      : ' — your account details are used and you do not need to fill in recipient fields'}
                    .
                    Otherwise enter recipient name, phone, email, and an optional message.
                  </p>
                </div>
              </div>
              <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
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
                              {itemRecipients.length === 0 ? (
                                <Button
                                  onClick={() => openAssignModal(item)}
                                  variant="outline"
                                  size="small"
                                  className="w-full sm:w-auto"
                                  disabled={
                                    recipientActionsBlocked ||
                                    (isGuestCheckoutFlow && !guestCanAssignRecipients)
                                  }
                                  title={
                                    recipientActionsBlocked
                                      ? 'Complete onboarding in your dashboard first'
                                      : isGuestCheckoutFlow && !guestCanAssignRecipients
                                        ? 'Sync your bag in step 1 first'
                                        : undefined
                                  }
                                >
                                  <Icon icon="bi:person-plus" className="mr-1.5" />
                                  Assign Recipient
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
                </>
              )}
            </CheckoutSection>

            {!recipientActionsBlocked &&
              ((isGuestCheckoutFlow && guestBagReady) ||
                (!isGuestCheckoutFlow && showPaymentMethodSection)) && (
              <CheckoutSection
                step={isGuestCheckoutFlow ? 2 : 3}
                title="Payment"
                subtitle={
                  canProceedToPayment
                    ? isGuestCheckoutFlow
                      ? 'Enter your details and choose how to pay.'
                      : 'Choose how you want to pay for this order.'
                    : 'Available after recipient details are complete.'
                }
              >
                {isGuestCheckoutFlow ? (
                  <div className="mb-6 space-y-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                    <p className="text-sm text-gray-600">
                      Your details for payment and receipts. Assign-to-self recipients are updated
                      automatically from these details.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...userInfoForm.register('first_name')}
                          error={userInfoForm.formState.errors.first_name?.message}
                          placeholder="Kojo"
                          className="w-full bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...userInfoForm.register('last_name')}
                          error={userInfoForm.formState.errors.last_name?.message}
                          placeholder="Sender"
                          className="w-full bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Phone number <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="phone_number"
                          control={userInfoForm.control}
                          render={({ field: { value, onChange, onBlur, ref } }) => (
                            <BasePhoneInput
                              ref={ref}
                              selectedVal={value || ''}
                              handleChange={onChange}
                              onBlur={onBlur}
                              error={
                                userInfoForm.formState.touchedFields.phone_number
                                  ? userInfoForm.formState.errors.phone_number?.message
                                  : undefined
                              }
                              placeholder={EXAMPLE_PHONE_LOCAL}
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Email <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <Input
                          type="email"
                          {...userInfoForm.register('email')}
                          error={userInfoForm.formState.errors.email?.message}
                          placeholder="john@example.com"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {showPaymentMethodSection ? (
                <>
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
                    {!isGuestCheckoutFlow ? (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Phone number (for payment) <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="phone_number"
                          control={userInfoForm.control}
                          render={({ field: { value, onChange, onBlur, ref } }) => (
                            <BasePhoneInput
                              ref={ref}
                              selectedVal={value || ''}
                              handleChange={onChange}
                              onBlur={onBlur}
                              error={
                                userInfoForm.formState.touchedFields.phone_number
                                  ? userInfoForm.formState.errors.phone_number?.message
                                  : undefined
                              }
                              placeholder={EXAMPLE_PHONE_LOCAL}
                            />
                          )}
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                {isCard && isKowri && !isGuestCheckoutFlow && (
                  <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...userInfoForm.register('first_name')}
                          error={userInfoForm.formState.errors.first_name?.message}
                          placeholder="John"
                          className="w-full bg-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          {...userInfoForm.register('last_name')}
                          error={userInfoForm.formState.errors.last_name?.message}
                          placeholder="Doe"
                          className="w-full bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          {...userInfoForm.register('email')}
                          error={userInfoForm.formState.errors.email?.message}
                          placeholder="john@example.com"
                          className="w-full bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-white/70 p-3">
                      <Icon
                        icon="bi:credit-card"
                        className="mt-0.5 size-5 shrink-0 text-blue-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Secure card payment</p>
                        <p className="mt-1 text-sm text-blue-700">
                          You will be redirected to a secure payment page to enter your card details
                          and complete the transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isCard && isKowri && isGuestCheckoutFlow && (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Icon icon="bi:credit-card" className="mt-0.5 size-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure card payment</p>
                      <p className="mt-1 text-sm text-blue-700">
                        You will be redirected to a secure payment page to complete your purchase.
                      </p>
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
                </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Click Complete Purchase to pay securely — you will be redirected to the payment
                    page.
                  </p>
                )}
              </CheckoutSection>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="mb-4 flex items-start gap-3">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white"
                  aria-hidden
                >
                  {isGuestCheckoutFlow ? 3 : 4}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Review order</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Confirm items and totals before you pay.
                  </p>
                </div>
              </div>
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

              {guestRequiresAccountMessage ? (
                <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                  <p className="font-medium">Guest purchase limit reached</p>
                  <p className="mt-1">{guestRequiresAccountMessage}</p>
                  <Link
                    to={ROUTES.IN_APP.AUTH.REGISTER}
                    className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary-700 no-underline hover:text-primary-800"
                  >
                    Create a free account
                    <Icon icon="bi:arrow-right" className="text-sm" />
                  </Link>
                </div>
              ) : null}
              {recipientActionsBlocked ? (
                <p className="text-sm text-amber-700 mb-3">
                  Complete onboarding in your dashboard before you can assign recipients or complete
                  this purchase.
                </p>
              ) : !allRecipientsAssigned ? (
                <p className="text-sm text-amber-600 mb-3">
                  Assign recipients to all gift cards before completing your purchase.
                </p>
              ) : null}
              {guestBagReady || !isGuestCheckoutFlow ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCheckout}
                loading={isCheckingOut}
                disabled={
                  isCheckingOut ||
                  !allRecipientsAssigned ||
                  recipientActionsBlocked ||
                  isUserInfoIncomplete
                }
              >
                {isCheckingOut
                  ? 'Processing...'
                  : hasFailedCheckoutCart
                    ? 'Retry payment'
                    : 'Complete Purchase'}
              </Button>
              ) : null}
            </div>

            {isGuestCheckoutFlow ? (
              <div className="hidden lg:block">
                <AccountBenefitsPanel variant="sidebar" showGuestCheckoutNote className="mt-4" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <PurchaseModal />

      <Modal
        isOpen={isPaymentPromptModalOpen}
        setIsOpen={setIsPaymentPromptModalOpen}
        title="Payment Prompt Sent"
        panelClass="max-w-md"
      >
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50/60 p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <Icon icon="bi:phone" className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Prompt sent to your mobile phone
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Approve the request on your phone to complete this payment.
              </p>
            </div>
          </div>

          {paymentPromptData && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Transaction details
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {paymentPromptData.receipt_number && (
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-gray-500">Receipt</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {paymentPromptData.receipt_number}
                    </span>
                  </div>
                )}
                {paymentPromptData.merchant_order_id && (
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-gray-500">Order ID</span>
                    <span className="max-w-[220px] wrap-break-word text-right text-sm font-medium text-gray-800">
                      {paymentPromptData.merchant_order_id}
                    </span>
                  </div>
                )}
                {paymentPromptData.transaction_id && (
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="max-w-[220px] wrap-break-word text-right text-sm font-medium text-gray-800">
                      {paymentPromptData.transaction_id}
                    </span>
                  </div>
                )}
                {paymentPromptData.status && (
                  <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className="text-sm text-gray-500">Status</span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        String(paymentPromptData.status).toUpperCase() === 'SUCCESS'
                          ? 'bg-green-100 text-green-700'
                          : String(paymentPromptData.status).toUpperCase() === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {paymentPromptData.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={() => setIsPaymentPromptModalOpen(false)}>
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
                          disabled={recipientActionsBlocked}
                          title={
                            recipientActionsBlocked
                              ? 'Complete onboarding in your dashboard first'
                              : undefined
                          }
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
      {showGuestCartDebug ? <GuestCartDebugPanel /> : null}
    </div>
  )
}
