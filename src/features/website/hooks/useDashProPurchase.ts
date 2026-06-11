import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DEFAULT_CURRENCY, formatCurrency } from '@/utils/format'
import { AssignRecipientSchema } from '@/utils/schemas'
import { useCreateCard } from '@/features/dashboard/hooks'
import { useCart } from './useCart'
import { useCartStore } from '@/stores/cart'
import { useUserProfile } from '@/hooks'
import { useRecipients } from '@/features/dashboard/hooks'
import { useAuthStore } from '@/stores'
import { getAssignToSelfContactPrefill } from '@/features/website/utils/assignToSelfContactPrefill'
import { useQueryClient } from '@tanstack/react-query'
import { createCustomDashProAndAddToCart, deleteGuestCartItem } from '@/features/website/services/cards'
import {
  assignGuestNamedRecipient,
  assignGuestSelfRecipient,
} from '@/features/website/utils/guestCustomCardAssign'
import { formatPersonName } from '@/utils/personName'
import { findCartItemIdByCardId } from '@/features/website/utils/customGiftCardCartHelpers'
import { useToast } from '@/hooks'
import {
  getApiErrorMessage,
  isGuestAmountThresholdMessage,
  isGuestCardMinimumPriceMessage,
} from '@/utils/apiError'
import { GuestCartAmountLimitError } from '@/features/website/utils/validateGuestLocalCart'
import {
  useAssignToSelfToggle,
  useCardFlipPreview,
} from '@/components/GiftCardRecipientForm'
import type { AssignRecipientPayload } from '@/types/responses'

const SILENT_MUTATION_TOASTS = { showSuccessToast: false, showErrorToast: false } as const

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

  const { mutate: createDashProCard } = useCreateCard({
    ...SILENT_MUTATION_TOASTS,
  })
  const { addToCartAsync, deleteCartItemAsync, refetch: refetchCart } = useCart()
  const { openCart } = useCartStore()
  const { useGetUserProfileService } = useUserProfile()
  const { data: userProfileData } = useGetUserProfileService()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isGuestAuth = useAuthStore((state) => state.isGuestAuth)
  const isMember = isAuthenticated && !isGuestAuth
  const user = useAuthStore((state) => state.user)
  const { useAssignRecipientService } = useRecipients()
  const assignRecipientMutation = useAssignRecipientService(SILENT_MUTATION_TOASTS)
  const toast = useToast()
  const queryClient = useQueryClient()
  const setGuestCartUuid = useAuthStore((state) => state.setGuestCartUuid)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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

  const removeCartLine = React.useCallback(
    async (cartItemId: string | number) => {
      try {
        await deleteCartItemAsync(cartItemId)
      } catch (rollbackError) {
        console.error('Failed to roll back cart item after assign failure:', rollbackError)
      }
    },
    [deleteCartItemAsync],
  )

  const onSubmit = async (data: z.infer<typeof AssignRecipientSchema>) => {
    setIsSubmitting(true)
    try {
      const recipientFullName = formatPersonName(data.first_name ?? '', data.last_name ?? '')
      const today = new Date()
      const issueDate = today.toISOString().split('T')[0]

      if (!isMember) {
        const { cartItemId } = await createCustomDashProAndAddToCart({
          price: amount,
          currency: 'GHS',
          country_code: (user as { country_code?: string } | null)?.country_code || 'GH',
          setGuestCartUuid,
        })
        try {
          if (data.assign_to_self) {
            await assignGuestSelfRecipient(cartItemId, amount, data.message || '')
          } else {
            await assignGuestNamedRecipient(cartItemId, amount, {
              recipient_name: recipientFullName,
              recipient_phone: data.phone?.trim(),
              recipient_email: data.email?.trim(),
              message: data.message || '',
            })
          }
        } catch (assignError) {
          try {
            await deleteGuestCartItem({ cart_item_id: cartItemId })
          } catch (rollbackError) {
            console.error('Failed to roll back guest cart item after assign failure:', rollbackError)
          }
          throw assignError
        }
        void queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        toast.success('DashPro gift card added to your bag')
        openCart()
        return
      }

      const cardResponse = await new Promise<any>((resolve, reject) => {
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

      const cardId =
        cardResponse?.data?.id ||
        cardResponse?.data?.card_id ||
        cardResponse?.data?.card?.id ||
        cardResponse?.id
      if (!cardId) {
        console.error('Failed to get card ID from response')
        toast.error('Failed to create DashPro card. Please try again.')
        return
      }

      const addToCartResponse = await addToCartAsync({
        card_id: cardId,
        quantity: 1,
      })
      let cartItemId = addToCartResponse?.data?.cart_item_id ?? null

      if (!cartItemId) {
        const cartItemsResponse = await refetchCart()
        cartItemId = findCartItemIdByCardId(cartItemsResponse?.data, cardId)
      }

      if (!cartItemId) {
        console.error('Failed to get cart_item_id after adding to cart')
        toast.error('Could not add DashPro to your bag. Please try again.')
        return
      }

      try {
        const assignPayload: AssignRecipientPayload = {
          cart_item_id: cartItemId,
          assign_to_self: data.assign_to_self,
          quantity: 1,
          amount,
          message: data.message || '',
        }
        if (!data.assign_to_self) {
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
        await assignRecipientMutation.mutateAsync(assignPayload)
      } catch (assignError) {
        await removeCartLine(cartItemId)
        throw assignError
      }

      toast.success('DashPro gift card added to your bag')
      openCart()
    } catch (error: unknown) {
      console.error('Error creating DashPro card and assigning recipient:', error)
      const message = getApiErrorMessage(error, 'Could not add DashPro to your bag. Please try again.')
      if (
        error instanceof GuestCartAmountLimitError ||
        isGuestAmountThresholdMessage(message) ||
        isGuestCardMinimumPriceMessage(message)
      ) {
        setError('amount', { type: 'server', message })
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
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
