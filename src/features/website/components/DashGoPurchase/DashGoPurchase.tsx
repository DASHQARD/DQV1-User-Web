import React from 'react'
import { Button, Combobox, Text } from '@/components'
import DashgoBg from '@/assets/svgs/dashgo_bg.svg'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DEFAULT_CURRENCY, formatCurrency } from '@/utils/format'
import { DashGoAssignRecipientSchema } from '@/utils/schemas'
import { usePublicCatalogQueries } from '../../hooks/website/usePublicCatalogQueries'
import { usePublicCatalogMutations } from '../../hooks/website/usePublicCatalogMutations'
import { useUserProfile } from '@/hooks'
import { useCartStore } from '@/stores/cart'
import { useCart, useRecipients } from '../../hooks'
import { useAuthStore } from '@/stores'
import { useQueryClient } from '@tanstack/react-query'
import { createCustomDashGoAndAddToCart, deleteGuestCartItem } from '../../services/cards'
import {
  assignGuestNamedRecipient,
  assignGuestSelfRecipient,
} from '../../utils/guestCustomCardAssign'
import { EXAMPLE_PHONE_PLACEHOLDER } from '@/utils/constants'
import { getAssignToSelfContactPrefill } from '../../utils/assignToSelfContactPrefill'
import { formatPersonName } from '@/utils/personName'
import { findCartItemIdByCardId } from '@/features/website/utils/customGiftCardCartHelpers'
import { didCreateEndpointAddToCart, extractCreateCartMeta } from '../../services/cards'
import { useToast } from '@/hooks'
import {
  getApiErrorMessage,
  isGuestAmountThresholdMessage,
  isGuestCardMinimumPriceMessage,
} from '@/utils/apiError'
import { GuestCartAmountLimitError } from '@/features/website/utils/validateGuestLocalCart'
import type { AssignRecipientPayload } from '@/types/responses'
import {
  AssignToSelfToggle,
  DASHGO_RECIPIENT_FIELDS,
  GiftCardAmountSection,
  GiftCardFlipPreview,
  GiftCardRecipientFields,
  GiftCardRecipientFormActions,
  GiftCardRecipientFormHeader,
  getAssignToSelfDescription,
  useAssignToSelfToggle,
  useCardFlipPreview,
} from '@/components/GiftCardRecipientForm'

const SILENT_MUTATION_TOASTS = { showSuccessToast: false, showErrorToast: false } as const

export default function DashGoPurchase() {
  const form = useForm<z.infer<typeof DashGoAssignRecipientSchema>>({
    resolver: zodResolver(DashGoAssignRecipientSchema),
    defaultValues: {
      assign_to_self: true,
      vendor_id: '',
      recipient_first_name: '',
      recipient_last_name: '',
      recipient_phone: '',
      recipient_email: '',
      recipient_message: '',
      recipient_card_amount: 100,
      recipient_card_currency: 'GHS',
      recipient_card_issue_date: new Date().toISOString().split('T')[0],
      recipient_card_expiry_date: '',
      recipient_card_images: [],
    },
  })

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
    watch,
  } = form

  // Watch form values for card preview
  const amount = useWatch({ control, name: 'recipient_card_amount' })
  const recipientFirstName = useWatch({ control, name: 'recipient_first_name' })
  const recipientLastName = useWatch({ control, name: 'recipient_last_name' })
  const recipientName = formatPersonName(recipientFirstName ?? '', recipientLastName ?? '')
  const message = useWatch({ control, name: 'recipient_message' })
  const vendorId = useWatch({ control, name: 'vendor_id' })

  const { useCreateDashGoAndAssignService } = usePublicCatalogMutations()
  const createDashGoMutationAsync = useCreateDashGoAndAssignService()
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

  const { assignToSelf, handleAssignToSelf, applyContactPrefill } = useAssignToSelfToggle({
    setValue,
    isGuestAuth,
    user,
    userProfileData: userProfileData ?? null,
    initialAssignToSelf: true,
    fieldNames: DASHGO_RECIPIENT_FIELDS,
  })

  const { isCardFlipped, isMobile, toggleCardFlip } = useCardFlipPreview()

  React.useEffect(() => {
    if (!assignToSelf) return
    applyContactPrefill()
  }, [assignToSelf, applyContactPrefill])

  const { usePublicVendorsService } = usePublicCatalogQueries()
  const { data: vendorsResponse } = usePublicVendorsService({ limit: 100 })

  const vendorsWithBranches = React.useMemo(() => {
    if (!vendorsResponse) return [] as any[]
    const vendorsData = Array.isArray(vendorsResponse)
      ? vendorsResponse
      : ((vendorsResponse as { data?: any[] })?.data ?? [])
    return (Array.isArray(vendorsData) ? vendorsData : []).filter(
      (vendor: any) => (vendor.branches_with_cards?.length ?? 0) > 0,
    )
  }, [vendorsResponse])

  const vendors = React.useMemo(
    () =>
      vendorsWithBranches.map((vendor: any) => ({
        id: vendor.id || vendor.vendor_id,
        vendor_id: vendor.vendor_id || vendor.id,
        name: vendor.business_name || vendor.branch_name || vendor.vendor_name || 'Unknown Vendor',
      })),
    [vendorsWithBranches],
  )

  const branches = React.useMemo(() => {
    if (!vendorId) return []
    const selectedVendor = vendorsWithBranches.find(
      (vendor: any) => String(vendor.vendor_id ?? vendor.id) === String(vendorId),
    )
    const branchList = selectedVendor?.branches_with_cards ?? []
    return branchList.map((branch: any) => ({
      branch_id: String(branch.branch_id ?? branch.id ?? ''),
      branch_name: branch.branch_name || 'Unnamed Branch',
      branch_location: branch.branch_location || '',
    }))
  }, [vendorId, vendorsWithBranches])

  const dashGoPreviewRecipientName = React.useMemo(() => {
    if (!assignToSelf) return recipientName || 'Recipient Name'
    const contact = getAssignToSelfContactPrefill({
      isGuestAuth,
      user,
      userProfileData: userProfileData ?? null,
    })
    return contact.name || recipientName || 'Your Name'
  }, [assignToSelf, recipientName, isGuestAuth, user, userProfileData])

  const onSubmit = async (data: z.infer<typeof DashGoAssignRecipientSchema>) => {
    const recipientFullName = formatPersonName(
      data.recipient_first_name ?? '',
      data.recipient_last_name ?? '',
    )
    // Calculate issue date in YYYY-MM-DD format
    const today = new Date()
    const issueDate = today.toISOString().split('T')[0] // YYYY-MM-DD format

    // Get selected vendor name
    const selectedVendor = vendors.find((v) => v.vendor_id === data.vendor_id)
    const vendorName = selectedVendor?.name || 'Unknown Vendor'

    // Map branches to redemption_branches format
    const redemptionBranches = branches.map((branch: any) => ({
      branch_id: String(branch.id || branch.branch_id),
    }))

    setIsSubmitting(true)
    try {
      if (!isMember) {
        const createResult = await createCustomDashGoAndAddToCart({
          vendor_id: data.vendor_id,
          vendorName,
          price: data.recipient_card_amount,
          currency: data.recipient_card_currency || 'GHS',
          redemption_branches: redemptionBranches,
          isGuestAuth: true,
          setGuestCartUuid,
        })
        const cartItemId = createResult?.cartItemId
        if (!cartItemId) {
          toast.error('Could not add DashGo to your bag. Please try again.')
          return
        }
        try {
          if (data.assign_to_self) {
            await assignGuestSelfRecipient(
              cartItemId,
              data.recipient_card_amount,
              data.recipient_message || '',
            )
          } else {
            await assignGuestNamedRecipient(cartItemId, data.recipient_card_amount, {
              recipient_name: recipientFullName,
              recipient_phone: data.recipient_phone?.trim(),
              recipient_email: data.recipient_email?.trim(),
              message: data.recipient_message || '',
            })
          }
        } catch (assignError) {
          try {
            await deleteGuestCartItem({ cart_item_id: cartItemId })
          } catch (rollbackError) {
            console.error(
              'Failed to roll back guest cart item after assign failure:',
              rollbackError,
            )
          }
          throw assignError
        }
        void queryClient.invalidateQueries({ queryKey: ['cart-items'] })
        toast.success('DashGo gift card added to your bag')
        openCart()
        return
      }

      const createResponse = await createDashGoMutationAsync.mutateAsync({
        vendor_id: data.vendor_id,
        product: 'DashGo Gift Card',
        description: `Custom DashGo card for ${vendorName}`,
        price: data.recipient_card_amount,
        currency: data.recipient_card_currency || 'GHS',
        issue_date: issueDate,
        redemption_branches: redemptionBranches,
      })

      const cardId =
        createResponse?.data?.card?.id ||
        createResponse?.data?.id ||
        createResponse?.data?.card_id ||
        createResponse?.id
      if (!cardId) {
        console.error('Failed to get card ID from response')
        return
      }

      let cartItemId: string | number | null = null
      const createCartMeta = extractCreateCartMeta(createResponse)
      if (createCartMeta.cartItemId) {
        cartItemId = createCartMeta.cartItemId
      }

      if (!cartItemId && !didCreateEndpointAddToCart(createResponse)) {
        const addToCartResponse = await addToCartAsync({
          card_id: cardId,
          quantity: 1,
        })
        cartItemId = addToCartResponse?.data?.cart_item_id ?? null
      }

      if (!cartItemId) {
        const cartItemsResponse = await refetchCart()
        cartItemId = findCartItemIdByCardId(cartItemsResponse?.data, cardId)
      }

      if (!cartItemId) {
        console.error('Failed to get cart_item_id after adding to cart')
        toast.error('Could not add DashGo to your bag. Please try again.')
        return
      }

      try {
        const assignPayload: AssignRecipientPayload = {
          cart_item_id: cartItemId,
          assign_to_self: data.assign_to_self,
          quantity: 1,
          amount: data.recipient_card_amount,
          message: data.recipient_message || '',
        }
        if (!data.assign_to_self) {
          if (recipientFullName) {
            assignPayload.name = recipientFullName
          }
          const recipientPhone = data.recipient_phone?.trim()
          if (recipientPhone) {
            assignPayload.phone = recipientPhone
          }
          const recipientEmail = data.recipient_email?.trim()
          if (recipientEmail) {
            assignPayload.email = recipientEmail
          }
        }
        await assignRecipientMutation.mutateAsync(assignPayload)
      } catch (assignError) {
        await removeCartLine(cartItemId)
        throw assignError
      }

      toast.success('DashGo gift card added to your bag')
      openCart()
    } catch (error: unknown) {
      console.error('Failed to create DashGo card:', error)
      const message = getApiErrorMessage(
        error,
        'Could not add DashGo to your bag. Please try again.',
      )
      if (
        error instanceof GuestCartAmountLimitError ||
        isGuestAmountThresholdMessage(message) ||
        isGuestCardMinimumPriceMessage(message)
      ) {
        setError('recipient_card_amount', { type: 'server', message })
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-4xl">
        <GiftCardRecipientFormHeader
          title="Create DashGo gift card"
          subtitle="Choose a vendor, set the amount, and personalize your gift"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col border border-[#f1f3f4]">
          <GiftCardFlipPreview
            cardTypeName="DashGo"
            backgroundImage={DashgoBg}
            displayAmount={formatCurrency(amount ? amount.toString() : 0, DEFAULT_CURRENCY)}
            displayRecipient={dashGoPreviewRecipientName}
            displayMessage={message || 'Your personalized message will appear here...'}
            isCardFlipped={isCardFlipped}
            isMobile={isMobile}
            onToggleFlip={toggleCardFlip}
          />

          <section className="border-b border-gray-100 px-10 py-8 max-w-2xl grid gap-6">
            <div>
              <Text variant="h3" weight="semibold" className="text-[#212529]">
                Select Vendor
              </Text>
              <Text variant="span" weight="medium" className="text-gray-500">
                Choose the vendor for this DashGo gift card
              </Text>
            </div>
            <Controller
              control={control}
              name="vendor_id"
              render={({ field, fieldState: { error } }) => (
                <Combobox
                  label="Vendor"
                  options={vendors.map((vendor) => ({
                    label: vendor.name,
                    value: vendor.vendor_id,
                  }))}
                  value={field.value || undefined}
                  onChange={(e: any) => {
                    const value = e?.target?.value || e?.value
                    const stringValue = value ? String(value) : ''
                    field.onChange(stringValue)
                  }}
                  error={error?.message}
                  placeholder="Select a vendor"
                />
              )}
            />
          </section>

          <AssignToSelfToggle
            checked={assignToSelf}
            onChange={handleAssignToSelf}
            description={getAssignToSelfDescription({
              assignToSelf,
              accountName: userProfileData?.fullname,
            })}
          />

          <GiftCardAmountSection
            control={control}
            name="recipient_card_amount"
            error={errors.recipient_card_amount?.message}
          />

          <GiftCardRecipientFields
            control={control}
            register={register}
            errors={errors}
            assignToSelf={assignToSelf}
            fieldNames={DASHGO_RECIPIENT_FIELDS}
            phonePlaceholder={EXAMPLE_PHONE_PLACEHOLDER}
          />

          <GiftCardRecipientFormActions>
            <Button type="button" variant="outline" className="md:w-auto">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className="md:w-auto"
              loading={isSubmitting}
              disabled={isSubmitting || !watch('vendor_id') || watch('vendor_id') === ''}
            >
              Create Customized DashGo Gift Card
            </Button>
          </GiftCardRecipientFormActions>
        </form>
      </div>
    </div>
  )
}
