import { Button, Input } from '@/components'
import { Icon } from '@/libs'
import { CURRENCY_PREFIX, DEFAULT_CURRENCY, formatCurrencyLabel } from '@/utils/format'
import {
  getApiErrorMessage,
  isGuestAmountThresholdMessage,
  isGuestCardMinimumPriceMessage,
} from '@/utils/apiError'
import { GuestCartAmountLimitError } from '@/features/website/utils/validateGuestLocalCart'
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
import { useToast } from '@/hooks'
import { createCustomDashGoAndAddToCart } from '../../services/cards'
import { assignGuestSelfRecipient } from '../../utils/guestCustomCardAssign'
import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { VENDOR_DASHGO_FORM } from '../../pages/vendors/vendorProfileUtils'

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
  vendorDetails: _vendorDetails,
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
  const setGuestCartUuid = useAuthStore((s) => s.setGuestCartUuid)
  const isMember = isAuthenticated && !isGuestAuth
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

    const redemptionBranches = availableBranches.map((branch: { branch_id: string }) => ({
      branch_id: branch.branch_id,
    }))

    if (redemptionBranches.length === 0) {
      toast.error('Select a vendor with at least one branch to add DashGo to your bag.')
      return
    }

    setIsSubmitting(true)
    try {
      const createResult = await createCustomDashGoAndAddToCart({
        vendor_id,
        vendorName,
        price: cardAmount,
        currency: DEFAULT_CURRENCY,
        redemption_branches: redemptionBranches,
        isGuestAuth: !isMember,
        setGuestCartUuid,
      })
      if (!isMember && createResult?.cartItemId) {
        await assignGuestSelfRecipient(createResult.cartItemId, cardAmount)
      }
      queryClient.invalidateQueries({ queryKey: ['cart-items'] })
      toast.success('DashGo gift card added to cart')
      openCart()
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to add DashGo to cart')
      if (
        err instanceof GuestCartAmountLimitError ||
        isGuestAmountThresholdMessage(message) ||
        isGuestCardMinimumPriceMessage(message)
      ) {
        form.setError('amount', { type: 'server', message })
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolvedAmount = resolveGiftCardAmount(watchedAmount || '0')

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={VENDOR_DASHGO_FORM}
    >
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Custom DashGo amount</h2>
        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
          Choose an amount for {vendorName}. The card works at their listed branch
          {availableBranches.length !== 1 ? 'es' : ''}.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2.5">Quick select</p>
        <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-2">
          {quickAmounts.map((amount) => {
            const isSelected = resolvedAmount === amount
            return (
              <button
                key={amount}
                type="button"
                onClick={() => form.setValue('amount', amount.toString())}
                className={`min-h-10 rounded-lg text-sm font-semibold transition-colors md:min-h-11 ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-800 border border-gray-200 hover:border-primary-300 lg:bg-white'
                }`}
              >
                {formatCurrencyLabel(amount, DEFAULT_CURRENCY, { minDecimals: 0, maxDecimals: 0 })}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2">Or enter amount</p>
        <Input
          type="number"
          step="0.01"
          min={String(GIFT_CARD_AMOUNT_MIN)}
          max={String(GIFT_CARD_AMOUNT_MAX)}
          prefix={
            <span className="pointer-events-none font-bold text-primary-500 text-base">
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
          innerClassName="h-12!"
          error={form.formState.errors.amount?.message}
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Max{' '}
          {formatCurrencyLabel(GIFT_CARD_AMOUNT_MAX, DEFAULT_CURRENCY, {
            minDecimals: 0,
            maxDecimals: 0,
          })}
        </p>
      </div>

      <div className="md:pt-1">
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
          className="w-full min-h-11 font-bold"
        >
          <Icon icon="bi:cart-plus" className="size-5 mr-2" />
          Add to cart
        </Button>
      </div>

    </form>
  )
}
