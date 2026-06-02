import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DEFAULT_CURRENCY, formatCurrency } from '@/utils/format'
import { AssignRecipientSchema } from '@/utils/schemas'
import { useCreateCard } from '@/features/dashboard/hooks'
import { useCart } from './useCart'
import { useGuestCart } from './useGuestCart'
import { useCartStore } from '@/stores/cart'
import { useUserProfile } from '@/hooks'
import { useRecipients } from '@/features/dashboard/hooks'
import { useAuthStore } from '@/stores'
import { useGuestLocalCartStore } from '@/stores/guestLocalCart'
import {
  GUEST_EMAIL_STORAGE_KEY,
  GUEST_NAME_STORAGE_KEY,
  getGuestContactSessionItem,
} from '@/utils/constants'
import { getAssignToSelfContactPrefill } from '@/features/website/utils/assignToSelfContactPrefill'
import { formatPersonName } from '@/utils/personName'
import { pickGuestCartIdentityFields } from '@/utils/guestContact'
import {
  addGuestCard,
  createGuestDashPro,
  extractGiftCardIdFromGuestCreate,
  extractGuestCardRecordId,
  extractGuestCreateCartMeta,
  getGuestCardSingle,
} from '@/features/website/services/cards'
import { useToast } from '@/hooks'
import { getApiErrorMessage, isGuestAmountThresholdMessage } from '@/utils/apiError'
import {
  assertGuestCartAmountWithinLimit,
  GuestCartAmountLimitError,
} from '@/features/website/utils/validateGuestLocalCart'
import {
  useAssignToSelfToggle,
  useCardFlipPreview,
} from '@/components/GiftCardRecipientForm'

export function useDashProPurchase() {
  const form = useForm<z.infer<typeof AssignRecipientSchema>>({
    resolver: zodResolver(AssignRecipientSchema),
    defaultValues: {
      assign_to_self: true,
      amount: 1000,
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      message: '',
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = form

  const amount = useWatch({ control, name: 'amount' })
  const recipientFirstName = useWatch({ control, name: 'first_name' })
  const recipientLastName = useWatch({ control, name: 'last_name' })
  const recipientName = formatPersonName(recipientFirstName ?? '', recipientLastName ?? '')
  const message = useWatch({ control, name: 'message' })

  const { mutate: createDashProCard, isPending: isCreatingDashProCard } = useCreateCard()
  const { addToCartAsync, refetch: refetchCart } = useCart()
  const { refetch: refetchGuestCart } = useGuestCart()
  const { openCart } = useCartStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isLocalGuest = !isAuthenticated && !isGuestAuth
  const addCustomDashProLine = useGuestLocalCartStore((s) => s.addCustomDashProLine)
  const user = useAuthStore((state) => state.user)
  const getGuestCartId = useAuthStore((state) => state.getGuestCartId)
  const setGuestCartId = useAuthStore((state) => state.setGuestCartId)
  const getGuestCartUuid = useAuthStore((state) => state.getGuestCartUuid)
  const setGuestCartUuid = useAuthStore((state) => state.setGuestCartUuid)
  const { useAssignRecipientService, useAssignGuestRecipientService } = useRecipients()
  const assignRecipientMutation = useAssignRecipientService()
  const assignGuestRecipientMutation = useAssignGuestRecipientService()
  const toast = useToast()

  const { assignToSelf, handleAssignToSelf, applyContactPrefill } = useAssignToSelfToggle({
    setValue,
    isGuestAuth,
    user,
    userProfileData: userProfileData ?? null,
    initialAssignToSelf: true,
  })

  const { isCardFlipped, isMobile, toggleCardFlip } = useCardFlipPreview()

  React.useEffect(() => {
    if (!assignToSelf) return
    applyContactPrefill()
  }, [assignToSelf, applyContactPrefill])

  const onSubmit = async (data: z.infer<typeof AssignRecipientSchema>) => {
    try {
      const recipientFullName = formatPersonName(data.first_name ?? '', data.last_name ?? '')
      const today = new Date()
      const issueDate = today.toISOString().split('T')[0]

      if (isLocalGuest) {
        try {
          assertGuestCartAmountWithinLimit(amount)
          addCustomDashProLine({
            amount,
            assign_to_self: data.assign_to_self,
            first_name: data.assign_to_self ? '' : data.first_name,
            last_name: data.assign_to_self ? '' : data.last_name,
            phone: data.assign_to_self ? '' : data.phone,
            email: data.assign_to_self ? '' : data.email,
            message: data.message || '',
            country_code: (user as { country_code?: string } | null)?.country_code || 'GH',
          })
          toast.success('DashPro gift card saved to your bag')
          openCart()
        } catch (error: unknown) {
          const message = getApiErrorMessage(error)
          if (error instanceof GuestCartAmountLimitError || isGuestAmountThresholdMessage(message)) {
            setError('amount', { type: 'server', message })
          }
          toast.error(message)
        }
        return
      }

      if (isGuestAuth) {
        assertGuestCartAmountWithinLimit(amount)
      }

      const guestIdentity = pickGuestCartIdentityFields(
        (user as any)?.guest_name ||
          getGuestContactSessionItem(GUEST_NAME_STORAGE_KEY) ||
          recipientFullName,
        (user as any)?.guest_email ||
          getGuestContactSessionItem(GUEST_EMAIL_STORAGE_KEY) ||
          data.email,
      )

      const cardResponse = isGuestAuth
        ? await createGuestDashPro({
            ...guestIdentity,
            product: 'DashPro',
            description: 'DashPro',
            price: amount,
            currency: 'GHS',
            issue_date: issueDate,
            images: [],
            terms_and_conditions: [],
            country_code: (user as any)?.country_code || 'GH',
          })
        : await new Promise<any>((resolve, reject) => {
            createDashProCard(
              {
                product: 'DashPro',
                description: 'DashPro',
                type: 'DashPro',
                price: amount,
                currency: 'GHS',
                issue_date: issueDate,
                images: [],
                terms_and_conditions: [],
              },
              {
                onSuccess: (response: any) => {
                  resolve(response)
                },
                onError: (error: any) => {
                  reject(error)
                },
              },
            )
          })

      const cardId = isGuestAuth
        ? extractGiftCardIdFromGuestCreate(cardResponse)
        : cardResponse?.data?.id ||
          cardResponse?.data?.card_id ||
          cardResponse?.data?.card?.id ||
          cardResponse?.id
      if (!cardId) {
        console.error('Failed to get card ID from response')
        toast.error('Failed to create DashPro card. Please try again.')
        return
      }

      if (isGuestAuth) {
        const guestCardRecordId = extractGuestCardRecordId(cardResponse)
        if (guestCardRecordId) {
          await getGuestCardSingle({ guest_card_id: guestCardRecordId })
        }
      }

      let cartItemId: string | number | null = null

      if (isGuestAuth) {
        const guestCartMeta = extractGuestCreateCartMeta(cardResponse)
        if (guestCartMeta.cartId) {
          setGuestCartUuid(guestCartMeta.cartId)
        }
        if (guestCartMeta.cartItemId) {
          cartItemId = guestCartMeta.cartItemId
        }

        if (!cartItemId) {
          const cartId = getGuestCartUuid() ?? getGuestCartId() ?? undefined

          const addResult = await addGuestCard({
            ...guestIdentity,
            card_id: String(cardId),
            quantity: 1,
            ...(cartId !== undefined && { cart_id: cartId }),
          })
          const nextCartId = addResult?.cart_id ?? (addResult as any)?.data?.cart_id
          if (typeof nextCartId === 'number') {
            setGuestCartId(nextCartId)
          }
          if (typeof nextCartId === 'string') {
            setGuestCartUuid(nextCartId)
          }
        }
      } else {
        await addToCartAsync({
          card_id: cardId,
          quantity: 1,
        })
      }

      if (!cartItemId) {
        const cartItemsResponse = isGuestAuth ? await refetchGuestCart() : await refetchCart()
        const cartItems = cartItemsResponse?.data || []

        if (Array.isArray(cartItems)) {
          for (const cart of cartItems) {
            if (cart.items) {
              const itemsArray = Array.isArray(cart.items) ? cart.items : [cart.items]
              const matchingItem = itemsArray.find(
                (item: any) =>
                  String(item.card_id) === String(cardId) ||
                  String(item.gift_card_id) === String(cardId),
              )
              if (matchingItem?.cart_item_id) {
                cartItemId = matchingItem.cart_item_id
                break
              }
            }
          }
        }
      }

      if (!cartItemId) {
        console.error('Failed to get cart_item_id after adding to cart')
        toast.error('Card was created but could not be assigned. Check your bag.')
        openCart()
        return
      }

      const assignPayload: any = {
        cart_item_id: cartItemId,
        assign_to_self: data.assign_to_self,
        quantity: 1,
        amount: amount,
        message: data.message || '',
      }

      if (!data.assign_to_self) {
        if (isGuestAuth) {
          if (recipientFullName) {
            assignPayload.recipient_name = recipientFullName
          }
          const recipientEmail = data.email?.trim()
          if (recipientEmail) {
            assignPayload.recipient_email = recipientEmail
          }
          const recipientPhone = data.phone?.trim()
          if (recipientPhone) {
            assignPayload.recipient_phone = recipientPhone
          }
        } else {
          if (recipientFullName) {
            assignPayload.name = recipientFullName
          }
          const recipientEmail = data.email?.trim()
          if (recipientEmail) {
            assignPayload.email = recipientEmail
          }
          const recipientPhone = data.phone?.trim()
          if (recipientPhone) {
            assignPayload.phone = recipientPhone
          }
        }
      }

      if (isGuestAuth) {
        await assignGuestRecipientMutation.mutateAsync(assignPayload)
      } else {
        await assignRecipientMutation.mutateAsync(assignPayload)
      }

      toast.success('DashPro gift card added to cart')
      openCart()
    } catch (error: unknown) {
      console.error('Error creating DashPro card and assigning recipient:', error)
      const message = getApiErrorMessage(error)
      if (
        error instanceof GuestCartAmountLimitError ||
        isGuestAmountThresholdMessage(message)
      ) {
        setError('amount', { type: 'server', message })
      }
      toast.error(message)
    }
  }

  const displayedCardAmount = formatCurrency(amount ? amount.toString() : 0, DEFAULT_CURRENCY)
  const displayedCardRecipient = React.useMemo(() => {
    if (assignToSelf) {
      const contact = getAssignToSelfContactPrefill({
        isGuestAuth,
        user,
        userProfileData: userProfileData ?? null,
      })
      return contact.name || recipientName || 'Your Name'
    }
    return recipientName || 'Recipient Name'
  }, [assignToSelf, recipientName, isGuestAuth, user, userProfileData])
  const displayedCardMessage = message || 'Your personalized message will appear here...'

  const isSubmitting =
    isCreatingDashProCard ||
    assignRecipientMutation.isPending ||
    assignGuestRecipientMutation.isPending

  return {
    control,
    register,
    handleSubmit,
    errors,
    assignToSelf,
    handleAssignToSelf,
    isCardFlipped,
    isMobile,
    toggleCardFlip,
    displayedCardAmount,
    displayedCardRecipient,
    displayedCardMessage,
    onSubmit,
    isSubmitting,
  }
}
