import { Button, Input, Text } from '@/components'
import { Icon } from '@/libs'
import { CURRENCY_PREFIX, DEFAULT_CURRENCY, formatCurrencyLabel } from '@/utils/format'
import {
  GIFT_CARD_AMOUNT_MAX,
  GIFT_CARD_AMOUNT_MIN,
  normalizeGiftCardAmountInput,
  parseGiftCardAmountInput,
  resolveGiftCardAmount,
} from '@/utils/giftCardAmount'
import { useForm } from 'react-hook-form'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores'
import { useGuestAddToCartModalStore } from '@/stores/guestAddToCartModal'
import { useToast } from '@/hooks'
import { createCustomDashGoAndAddToCart } from '../../services/cards'
import {
  getGuestEmailFromAuth,
  getGuestNameFromAuth,
  getGuestPhoneFromAuth,
} from '../../utils/guestAuth'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'

interface PublicDashGoFormProps {
  vendorName: string
  vendorDetails: any
  availableBranches: any[]
  quickAmounts: number[]
  selectedAmount: string
  onAmountChange?: (amount: string) => void
  vendor_id: string
}

export default function PublicDashGoForm({
  vendorName,
  vendorDetails,
  availableBranches,
  quickAmounts,
  selectedAmount,
  onAmountChange,
  vendor_id,
}: PublicDashGoFormProps) {
  const { openCart } = useCartStore()
  const queryClient = useQueryClient()
  const toast = useToast()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isGuestAuth = useAuthStore((s) => s.isGuestAuth)
  const user = useAuthStore((s) => s.user)
  const getGuestCartId = useAuthStore((s) => s.getGuestCartId)
  const getGuestCartUuid = useAuthStore((s) => s.getGuestCartUuid)
  const setGuestCartId = useAuthStore((s) => s.setGuestCartId)
  const setGuestCartUuid = useAuthStore((s) => s.setGuestCartUuid)
  const openGuestModal = useGuestAddToCartModalStore((s) => s.open)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<{ amount: string }>({
    mode: 'onChange',
    defaultValues: {
      amount: selectedAmount || '100',
    },
  })

  const watchedAmount = form.watch('amount')

  React.useEffect(() => {
    const raw = watchedAmount ?? ''
    const normalized = normalizeGiftCardAmountInput(raw)
    if (normalized !== raw) {
      form.setValue('amount', normalized, { shouldValidate: true, shouldDirty: true })
      return
    }
    onAmountChange?.(String(resolveGiftCardAmount(normalized)))
  }, [watchedAmount, onAmountChange, form])

  const onSubmit = async (data: { amount: string }) => {
    const parsed = parseGiftCardAmountInput(normalizeGiftCardAmountInput(data.amount))
    if (parsed === null || parsed < GIFT_CARD_AMOUNT_MIN) {
      return
    }
    const cardAmount = resolveGiftCardAmount(data.amount)

    if (!vendor_id) {
      return
    }

    if (!isAuthenticated) {
      openGuestModal({
        card_id: 0,
        product: 'DashGo Gift Card',
        price: cardAmount,
        type: 'dashgo',
        authOnly: true,
      })
      toast.success('Verify your phone to continue, then add to cart again.')
      return
    }

    const redemptionBranches = availableBranches.map((branch: { branch_id: string }) => ({
      branch_id: branch.branch_id,
    }))

    setIsSubmitting(true)
    try {
      await createCustomDashGoAndAddToCart({
        vendor_id,
        vendorName,
        price: cardAmount,
        currency: DEFAULT_CURRENCY,
        redemption_branches: redemptionBranches,
        isGuestAuth,
        guestContact: isGuestAuth
          ? {
              guest_phone: getGuestPhoneFromAuth(user),
              guest_name: getGuestNameFromAuth(user),
              guest_email: getGuestEmailFromAuth(user),
            }
          : undefined,
        getGuestCartId,
        getGuestCartUuid,
        setGuestCartId,
        setGuestCartUuid,
      })
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      toast.success('DashGo gift card added to cart')
      openCart()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add DashGo to cart'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-1">
        <Text variant="h1" className="capitalize">
          DashGo Gift Qard
        </Text>
        <Text variant="p" className="text-grey-500">
          Vendor: {vendorName}
        </Text>
        <div className="flex items-center gap-1">
          <Icon icon="bi:geo-alt-fill" className="size-4 text-grey-500" />
          <Text variant="p" className="text-grey-500">
            {(vendorDetails as any)?.business_country ||
              (vendorDetails as any)?.business_address ||
              'Location not available'}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Text variant="h2" className="capitalize">
          Description
        </Text>
        <Text variant="p" className="text-grey-600 leading-relaxed">
          Create a custom DashGo gift card with your desired amount for {vendorName}. Use this card
          at {vendorName} locations.
        </Text>
      </div>

      {/* Amount Input */}
      <div>
        <Text variant="h3" weight="bold" className="text-gray-900 mb-4">
          Select Amount
        </Text>

        {/* Quick Selection Buttons */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {quickAmounts.map((amount) => {
            const isSelected = resolveGiftCardAmount(watchedAmount || '0') === amount
            return (
              <button
                key={amount}
                type="button"
                onClick={() => form.setValue('amount', amount.toString())}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                }`}
              >
                {formatCurrencyLabel(amount, DEFAULT_CURRENCY, { minDecimals: 0, maxDecimals: 0 })}
              </button>
            )
          })}
        </div>

        {/* Amount Input Field */}

        <Input
          type="number"
          step="0.01"
          min={String(GIFT_CARD_AMOUNT_MIN)}
          max={String(GIFT_CARD_AMOUNT_MAX)}
          prefix={
            <span className="pointer-events-none font-bold text-primary-500 text-lg">
              {CURRENCY_PREFIX}
            </span>
          }
          {...form.register('amount', {
            required: 'Amount is required',
            validate: (value) => {
              const parsed = parseGiftCardAmountInput(normalizeGiftCardAmountInput(value))
              if (parsed === null) {
                return 'Please enter a valid amount greater than 0'
              }
              if (parsed < GIFT_CARD_AMOUNT_MIN) {
                return `Minimum amount is ${formatCurrencyLabel(GIFT_CARD_AMOUNT_MIN, DEFAULT_CURRENCY, { minDecimals: 0, maxDecimals: 0 })}`
              }
              if (parsed > GIFT_CARD_AMOUNT_MAX) {
                return `Maximum amount is ${formatCurrencyLabel(GIFT_CARD_AMOUNT_MAX, DEFAULT_CURRENCY, { minDecimals: 0, maxDecimals: 0 })}`
              }
              return true
            },
          })}
          placeholder="0.00"
          innerClassName="h-[56px]!"
          error={form.formState.errors.amount?.message}
        />

        <p className="mt-2 text-sm text-gray-500">
          Maximum amount:{' '}
          {formatCurrencyLabel(GIFT_CARD_AMOUNT_MAX, DEFAULT_CURRENCY, {
            minDecimals: 0,
            maxDecimals: 0,
          })}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          type="submit"
          disabled={
            !form.watch('amount') ||
            parseGiftCardAmountInput(normalizeGiftCardAmountInput(form.watch('amount') || '')) ===
              null ||
            isSubmitting ||
            !vendor_id
          }
          loading={isSubmitting}
          className="flex-1"
        >
          <Icon icon="bi:cart-plus" className="size-5 mr-2" />
          Add to Cart
        </Button>
      </div>
    </form>
  )
}
