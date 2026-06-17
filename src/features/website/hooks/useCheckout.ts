import React, { useMemo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import { flattenServerCartItems } from '@/features/website/utils/guestLocalCartDisplay'
import { isLocalGuestCartLineId } from '@/stores/guestLocalCart'
import { filterShoppingCarts } from '@/features/website/utils/cartFilters'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { usePayments } from './usePayments'
import { usePersistedModalState, useToast, useNetworkStatus } from '@/hooks'
import { useUserProfile } from '@/hooks'
import { MODAL_NAMES } from '@/utils/constants'
import { bulkAssignRecipients } from '@/features/dashboard/services'
import { isValidEmailAddress, isValidInternationalPhoneDigits } from '@/utils/schemas/shared'
import {
  UserInfoSchema,
  GuestUserInfoSchema,
  PaymentMethodSchema,
  type UserInfoFormData,
  type GuestUserInfoFormData,
  type PaymentMethodFormData,
} from '@/utils/schemas/checkout'
import { getCardBackground, getImageUrl, getCardTypeName } from '@/utils/cardDisplay'
import type { CartListResponse } from '@/types/responses'
import type { FlattenedCartItem } from '@/types'
import type { CheckoutPayloadBase, GuestCheckoutPayloadBase } from '@/types/responses'
import type { CheckoutPayload, GuestCheckoutPayload } from '@/types'
import { CHECKOUT_GATEWAY } from '@/features/website/utils/paymentConstants'
import {
  appendGatewayFields,
  isHostedRedirectGateway,
} from '@/features/website/utils/checkoutPayload'
import type {
  CheckoutFollowUp,
  PaymentPromptData,
} from '@/features/website/utils/checkoutRedirect'
import { getGuestCart, resolveGuestCartUuid } from '@/features/website/services/cards'
import {
  normalizeCartStatus,
  persistCheckoutCartId,
} from '@/features/website/utils/cartLifecycle'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  GUEST_PHONE_STORAGE_KEY,
  getGuestContactSessionItem,
  setGuestContactSessionItem,
} from '@/utils/constants'
import {
  getGuestEmailFromAuth,
  getGuestNameFromAuth,
  getGuestPhoneFromAuth,
} from '@/features/website/utils/guestAuth'
import { useMemberMustCompleteOnboardingForCustomCards } from './useMemberMustCompleteOnboardingForCustomCards'
import { useGuestRecipientsByCartItems } from './useGuestQueries'
import { getRecipientsForCartUnit, type CartRecipient } from '@/features/website/utils/cartRecipientUnits'
import {
  computeAmountCharged,
  computeServiceFee,
  resolveServiceFeeRate,
} from '@/utils/pricingFees'
import { formatPersonName, splitPersonName } from '@/utils/personName'
import { isNetworkError, resolveRequestErrorMessage } from '@/utils/networkError'

/** Checkout-specific flattened cart item (one row per quantity unit, with quantity_index) */
export type CheckoutFlattenedCartItem = FlattenedCartItem & {
  quantity_index?: number
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { isOnline } = useNetworkStatus()
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isSessionReady = useAuthStore((state) => state.isSessionReady)
  const { recipientActionsBlocked } = useMemberMustCompleteOnboardingForCustomCards()
  const localContact = useGuestLocalCartStore((s) => s.contact)
  const setLocalContact = useGuestLocalCartStore((s) => s.setContact)
  const isGuestCheckoutFlow = isGuestAuth
  const userCart = useCart()
  const guestCart = useGuestCart()

  const cartItems = isGuestAuth ? guestCart.cartItems : userCart.cartItems
  const isLoadingCart = isGuestAuth ? guestCart.isLoading : userCart.isLoading

  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const guestCartRefetch = guestCart.refetch
  const { useCheckoutService, useGuestCheckoutService, usePaymentProviderConfig, useServiceFeesConfig } =
    usePayments()
  const [guestRequiresAccountMessage, setGuestRequiresAccountMessage] = useState<string | null>(
    null,
  )
  const [checkoutNetworkError, setCheckoutNetworkError] = useState(false)
  const handleCheckoutNetworkError = useCallback(() => setCheckoutNetworkError(true), [])
  const { mutateAsync: checkoutMutation, isPending: isMemberCheckingOut } = useCheckoutService({
    onNetworkError: handleCheckoutNetworkError,
  })
  const { mutateAsync: guestCheckoutMutation, isPending: isGuestCheckingOut } = useGuestCheckoutService(
    {
      onCartRefetch: () => {
        void guestCartRefetch()
      },
      onRequiresAccount: (message) => setGuestRequiresAccountMessage(message),
      onNetworkError: handleCheckoutNetworkError,
    },
  )
  const isCheckingOut = isGuestAuth ? isGuestCheckingOut : isMemberCheckingOut
  const setGuestCartUuid = useAuthStore((s) => s.setGuestCartUuid)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const { data: paymentProviderConfig } = usePaymentProviderConfig()
  const { data: serviceFeesConfig } = useServiceFeesConfig()

  const checkoutGateway = (paymentProviderConfig?.checkout_gateway ?? '').toLowerCase()

  const isPersonalDetailsCompleted =
    (userProfileData as any)?.onboarding_progress?.personal_details_completed === true

  const checkoutUserInfoSchema = useMemo(
    () => (isGuestAuth ? GuestUserInfoSchema : UserInfoSchema),
    [isGuestAuth],
  )

  const userInfoForm = useForm<UserInfoFormData | GuestUserInfoFormData>({
    resolver: zodResolver(checkoutUserInfoSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: isGuestAuth
      ? {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
        }
      : {
          ...splitPersonName((userProfileData as any)?.fullname ?? ''),
          email: (userProfileData as any)?.email ?? '',
          phone_number: (userProfileData as any)?.phonenumber ?? '',
        },
  })

  const user = useAuthStore((state) => state.user)

  React.useEffect(() => {
    if (isGuestAuth) {
      const savedName =
        formatPersonName(localContact.first_name ?? '', localContact.last_name ?? '') ||
        localContact.full_name?.trim() ||
        getGuestNameFromAuth(user) ||
        getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY) ||
        ''
      userInfoForm.reset({
        ...splitPersonName(savedName),
        email:
          localContact.email ||
          getGuestEmailFromAuth(user) ||
          getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY) ||
          '',
        phone_number:
          localContact.phone ||
          getGuestPhoneFromAuth(user) ||
          getGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY) ||
          '',
      })
    } else if (userProfileData) {
      userInfoForm.reset({
        ...splitPersonName(userProfileData?.fullname ?? ''),
        email: userProfileData?.email ?? '',
        phone_number: userProfileData?.phonenumber ?? '',
      })
    }
  }, [isGuestAuth, localContact, user, userProfileData, userInfoForm])

  type PaymentMethodFormValues = Omit<PaymentMethodFormData, 'expiry_month' | 'expiry_year'> & {
    expiry_month?: unknown
    expiry_year?: unknown
  }

  const paymentForm = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(PaymentMethodSchema),
    defaultValues: {
      payment_method_type: 'mobile_money',
    },
  })

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isMissingRecipientsModalOpen, setIsMissingRecipientsModalOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [paymentPromptData, setPaymentPromptData] = useState<PaymentPromptData | null>(null)
  const [isPaymentPromptModalOpen, setIsPaymentPromptModalOpen] = useState(false)
  const modal = usePersistedModalState({
    paramName: MODAL_NAMES.RECIPIENT.ASSIGN,
  })

  const activeCartItems = useMemo(() => {
    if (!Array.isArray(cartItems)) return []
    return filterShoppingCarts(cartItems)
  }, [cartItems])

  const pendingCartItems = activeCartItems

  const hasFailedCheckoutCart = useMemo(() => {
    const status = activeCartItems[0]?.cart_status
    return normalizeCartStatus(status) === 'failed'
  }, [activeCartItems])

  const serverDisplayCartItems = useMemo(
    () => flattenServerCartItems(activeCartItems) as CheckoutFlattenedCartItem[],
    [activeCartItems],
  )

  const displayCartItems = serverDisplayCartItems

  const guestCheckoutCartItemIds = useMemo(
    () =>
      isGuestAuth
        ? [
            ...new Set(
              displayCartItems
                .map((item) => item.cart_item_id)
                .filter((id): id is string | number => id != null && id !== ''),
            ),
          ]
        : [],
    [displayCartItems, isGuestAuth],
  )

  const { recipientsByCartItem: guestRecipientsByCartItem } = useGuestRecipientsByCartItems(
    guestCheckoutCartItemIds.filter((id) => !isLocalGuestCartLineId(id)),
    isGuestAuth && isSessionReady,
  )

  const recipientsByCartItem = useMemo(() => {
    const map: Record<string, any[]> = {}
    if (isGuestAuth) {
      displayCartItems.forEach((item) => {
        const cid = item.cart_item_id
        if (cid == null || cid === '' || isLocalGuestCartLineId(cid)) return
        const key = `${cid}-${item.quantity_index ?? 0}`
        const all = (guestRecipientsByCartItem[String(cid)] ?? []) as CartRecipient[]
        const unitAmount = parseFloat(item.amount || '0')
        map[key] = getRecipientsForCartUnit(all, item.quantity_index ?? 0, unitAmount)
      })
      return map
    }
    activeCartItems.forEach((cart: CartListResponse) => {
      if (!cart.items) return
      const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
      itemsArray.forEach((item: any) => {
        const recipients = item.recipients ?? []
        const qty = item.total_quantity || 1
        const totalItemAmount = parseFloat(item.total_amount || '0')
        const unitAmount = qty > 0 ? totalItemAmount / qty : totalItemAmount
        for (let i = 0; i < qty; i++) {
          const key = `${item.cart_item_id}-${i}`
          map[key] = getRecipientsForCartUnit(recipients, i, unitAmount)
        }
      })
    })
    return map
  }, [activeCartItems, displayCartItems, isGuestAuth, guestRecipientsByCartItem])

  const serverCartSubtotal = useMemo(
    () =>
      activeCartItems.reduce((sum, cart) => sum + parseFloat(cart.total_amount || '0'), 0),
    [activeCartItems],
  )

  const totalAmount = serverCartSubtotal
  const serviceFeeRate = resolveServiceFeeRate(serviceFeesConfig?.serviceFeeRate)
  const serviceFee = computeServiceFee(totalAmount, serviceFeeRate)
  const amountDue = computeAmountCharged(totalAmount, serviceFeeRate)

  const hasNetworkIssue = useMemo(() => {
    if (!isOnline) return true
    return checkoutNetworkError
  }, [isOnline, checkoutNetworkError])

  React.useEffect(() => {
    if (isOnline) {
      setCheckoutNetworkError(false)
    }
  }, [isOnline])

  const contactPhone = userInfoForm.watch('phone_number')
  const contactEmail = userInfoForm.watch('email')
  const contactFirstName = userInfoForm.watch('first_name')
  const contactLastName = userInfoForm.watch('last_name')

  const isUserInfoIncomplete = isGuestAuth
    ? !contactFirstName?.trim() ||
      !contactLastName?.trim() ||
      !isValidInternationalPhoneDigits(contactPhone ?? '') ||
      (Boolean(contactEmail?.trim()) && !isValidEmailAddress(contactEmail ?? ''))
    : !contactFirstName?.trim() ||
      !contactLastName?.trim() ||
      !isValidEmailAddress(contactEmail ?? '') ||
      !isValidInternationalPhoneDigits(contactPhone ?? '')

  const guestBagReady = isGuestAuth
  const senderStepComplete = !isUserInfoIncomplete
  const guestCanAssignRecipients =
    isGuestCheckoutFlow && guestBagReady && !recipientActionsBlocked

  const itemsMissingRecipients = useMemo(() => {
    return displayCartItems.filter((item) => {
      const key =
        item.cart_item_id != null ? `${item.cart_item_id}-${item.quantity_index ?? 0}` : ''
      const count = key ? (recipientsByCartItem[key]?.length ?? 0) : 0
      return count < 1
    })
  }, [displayCartItems, recipientsByCartItem])

  const applyCheckoutFollowUp = useCallback((followUp: CheckoutFollowUp) => {
    if (followUp.type === 'momo_prompt') {
      setPaymentPromptData(followUp.data)
      setIsPaymentPromptModalOpen(true)
    }
  }, [])

  const resolveGuestCartUuidForCheckout = useCallback(async (): Promise<string | null> => {
    const fromCart = activeCartItems[0]?.guest_cart_uuid
    if (fromCart?.trim()) {
      setGuestCartUuid(fromCart.trim())
      return fromCart.trim()
    }
    const stored = getGuestCartUuid()
    if (stored?.trim()) return stored.trim()
    const cartResponse = await getGuestCart()
    const uuid = resolveGuestCartUuid(cartResponse)
    if (uuid) {
      setGuestCartUuid(uuid)
      return uuid
    }
    return null
  }, [activeCartItems, getGuestCartUuid, setGuestCartUuid])

  const persistGuestContactFromForm = useCallback(() => {
    const userValues = userInfoForm.getValues() as GuestUserInfoFormData
    const firstName = userValues.first_name?.trim() ?? ''
    const lastName = userValues.last_name?.trim() ?? ''
    const guestFullName = formatPersonName(firstName, lastName)
    setLocalContact({
      phone: userValues.phone_number,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
      full_name: guestFullName || undefined,
      email: userValues.email,
    })
    if (userValues.phone_number) {
      setGuestContactSessionItem(GUEST_PHONE_STORAGE_KEY, userValues.phone_number)
    }
    if (guestFullName) {
      setGuestContactSessionItem(GUEST_NAME_STORAGE_KEY, guestFullName)
    }
    if (userValues.email?.trim()) {
      setGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY, userValues.email.trim())
    }
  }, [setLocalContact, userInfoForm])

  const handleCheckout = useCallback(async () => {
    if (!isOnline) {
      setCheckoutNetworkError(true)
      return
    }
    setCheckoutNetworkError(false)

    if (recipientActionsBlocked) {
      toast.error('Complete onboarding in your dashboard before checkout.')
      return
    }
    if (itemsMissingRecipients.length > 0) {
      setIsMissingRecipientsModalOpen(true)
      return
    }
    const contactValid = await userInfoForm.trigger()
    if (!contactValid) return

    if (isGuestAuth) {
      persistGuestContactFromForm()
    }

    const firstCart = activeCartItems[0]
    if (!firstCart) return

    if (!isGuestAuth) {
      persistCheckoutCartId(firstCart.cart_id)
    }

    const userValues = userInfoForm.getValues() as UserInfoFormData | GuestUserInfoFormData
    const guestFullName = formatPersonName(
      userValues.first_name?.trim() ?? '',
      userValues.last_name?.trim() ?? '',
    )
    const gateway = checkoutGateway
    const paymentValues = paymentForm.getValues()
    const paymentMethod = paymentValues.payment_method_type ?? 'mobile_money'
    const phone = userValues.phone_number ?? ''

    const runMutation = async (payload: CheckoutPayload | GuestCheckoutPayload) => {
      const result = isGuestAuth
        ? await guestCheckoutMutation(payload as GuestCheckoutPayload)
        : await checkoutMutation(payload as CheckoutPayload)
      applyCheckoutFollowUp(result.followUp)
      return result
    }

    if (isGuestAuth) {
      let guestCartUuid: string | null
      try {
        guestCartUuid = await resolveGuestCartUuidForCheckout()
      } catch (error) {
        if (isNetworkError(error)) {
          setCheckoutNetworkError(true)
        }
        toast.error(
          resolveRequestErrorMessage(
            error,
            'Could not load your cart. Please refresh the page and try again.',
          ),
        )
        return
      }

      if (!guestCartUuid) {
        toast.error('Could not load your cart. Please refresh the page and try again.')
        void guestCartRefetch()
        return
      }

      const guestEmail =
        'email' in userValues && userValues.email?.trim() ? userValues.email.trim() : undefined
      const guestBase: GuestCheckoutPayloadBase = {
        guest_cart_id: guestCartUuid,
        phone_number: userValues.phone_number,
        full_name: guestFullName.trim(),
        ...(guestEmail ? { email: guestEmail } : {}),
      }

      if (isHostedRedirectGateway(gateway)) {
        await runMutation(guestBase)
        return
      }

      if (gateway === CHECKOUT_GATEWAY.EGNANOW) {
        if (paymentMethod === 'mobile_money') {
          const valid = await paymentForm.trigger('paypartner_code')
          if (!valid) return
          if (!paymentValues.paypartner_code) return
        } else if (paymentMethod === 'card') {
          const valid = await paymentForm.trigger([
            'card_number',
            'expiry_month',
            'expiry_year',
            'cvv',
          ])
          if (!valid) return
          const { card_number, expiry_month, expiry_year, cvv } = paymentForm.getValues()
          if (!card_number || expiry_month == null || expiry_year == null || !cvv) return
        }
        await runMutation(
          appendGatewayFields(guestBase, gateway, paymentMethod, phone, paymentValues) as GuestCheckoutPayload,
        )
        return
      }

      if (gateway === CHECKOUT_GATEWAY.KOWRI) {
        if (paymentMethod === 'mobile_money') {
          const valid = await paymentForm.trigger('kowri_provider')
          if (!valid) return
          if (!paymentValues.kowri_provider) return
        }
        await runMutation(
          appendGatewayFields(guestBase, gateway, paymentMethod, phone, paymentValues) as GuestCheckoutPayload,
        )
        return
      }

      await runMutation(guestBase)
      return
    }

    const memberBase: CheckoutPayloadBase = {
      cart_id: firstCart.cart_id,
      full_name: guestFullName,
      email: userValues.email ?? '',
      phone_number: userValues.phone_number,
    }

    if (isHostedRedirectGateway(gateway)) {
      await runMutation(memberBase)
      return
    }

    if (gateway === CHECKOUT_GATEWAY.EGNANOW) {
      if (paymentMethod === 'mobile_money') {
        const valid = await paymentForm.trigger('paypartner_code')
        if (!valid) return
        if (!paymentValues.paypartner_code) return
      } else if (paymentMethod === 'card') {
        const valid = await paymentForm.trigger([
          'card_number',
          'expiry_month',
          'expiry_year',
          'cvv',
        ])
        if (!valid) return
        const { card_number, expiry_month, expiry_year, cvv } = paymentForm.getValues()
        if (!card_number || expiry_month == null || expiry_year == null || !cvv) return
      }
      await runMutation(
        appendGatewayFields(memberBase, gateway, paymentMethod, phone, paymentValues) as CheckoutPayload,
      )
      return
    }

    if (gateway === CHECKOUT_GATEWAY.KOWRI) {
      if (paymentMethod === 'mobile_money') {
        const valid = await paymentForm.trigger('kowri_provider')
        if (!valid) return
        if (!paymentValues.kowri_provider) return
      }
      await runMutation(
        appendGatewayFields(memberBase, gateway, paymentMethod, phone, paymentValues) as CheckoutPayload,
      )
      return
    }

    await runMutation(memberBase)
  }, [
    isGuestAuth,
    activeCartItems,
    userInfoForm,
    persistGuestContactFromForm,
    paymentForm,
    checkoutGateway,
    checkoutMutation,
    guestCheckoutMutation,
    itemsMissingRecipients,
    recipientActionsBlocked,
    toast,
    applyCheckoutFollowUp,
    resolveGuestCartUuidForCheckout,
    guestCartRefetch,
    isOnline,
  ])

  const bulkAssignMutation = useMutation({
    mutationFn: (file: File) => bulkAssignRecipients(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      queryClient.invalidateQueries({ queryKey: ['cart-all-recipients'] })
      setBulkFile(null)
      setIsBulkModalOpen(false)
    },
  })

  const handleBulkUpload = useCallback(() => {
    if (!bulkFile) return
    bulkAssignMutation.mutate(bulkFile)
  }, [bulkFile, bulkAssignMutation])

  const openAssignModal = useCallback(
    (item: CheckoutFlattenedCartItem) => {
      if (recipientActionsBlocked) return
      if (!item.cart_item_id) return
      const perRecipientAmountRaw = parseFloat(item.amount || '0')
      // DashPro amount input uses step=0.01; round to 2dp to avoid browser "nearest valid values" errors
      const perRecipientAmount = Math.round(perRecipientAmountRaw * 100) / 100
      modal.openModal(MODAL_NAMES.RECIPIENT.ASSIGN, {
        cart_item_id: item.cart_item_id,
        cardType: item.type,
        cardProduct: item.product,
        cardCurrency: item.currency || 'GHS',
        amount: perRecipientAmount,
      })
    },
    [modal, recipientActionsBlocked],
  )

  const openAssignModalFromMissing = useCallback(
    (item: CheckoutFlattenedCartItem) => {
      if (recipientActionsBlocked) return
      setIsMissingRecipientsModalOpen(false)
      openAssignModal(item)
    },
    [openAssignModal, recipientActionsBlocked],
  )

  return {
    isLoadingCart,
    pendingCartItems,
    displayCartItems,
    totalAmount,
    serviceFee,
    amountDue,
    hasNetworkIssue,
    userInfoForm,
    userInfo: userInfoForm.watch(),
    paymentForm,
    paymentMethod: paymentForm.watch(),
    checkoutGateway,
    isPersonalDetailsCompleted,
    isUserInfoIncomplete,
    senderStepComplete,
    guestCanAssignRecipients,
    isGuestAuth,
    isGuestCheckoutFlow,
    guestBagReady,
    guestRequiresAccountMessage,
    setGuestRequiresAccountMessage,
    recipientsByCartItem,
    itemsMissingRecipients,
    allRecipientsAssigned: itemsMissingRecipients.length === 0,
    recipientActionsBlocked,
    handleCheckout,
    bulkAssignMutation,
    handleBulkUpload,
    getCardBackground,
    getImageUrl,
    getCardTypeName,
    openAssignModal,
    openAssignModalFromMissing,
    isCheckingOut,
    hasFailedCheckoutCart,
    isBulkModalOpen,
    setIsBulkModalOpen,
    isMissingRecipientsModalOpen,
    setIsMissingRecipientsModalOpen,
    bulkFile,
    setBulkFile,
    paymentPromptData,
    isPaymentPromptModalOpen,
    setIsPaymentPromptModalOpen,
    /** @deprecated use paymentPromptData */
    kowriCheckoutData: paymentPromptData,
    /** @deprecated use isPaymentPromptModalOpen */
    isKowriPromptModalOpen: isPaymentPromptModalOpen,
    /** @deprecated use setIsPaymentPromptModalOpen */
    setIsKowriPromptModalOpen: setIsPaymentPromptModalOpen,
  }
}
