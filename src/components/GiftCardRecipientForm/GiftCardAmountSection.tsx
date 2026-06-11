import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Icon } from '@/libs'
import { GiftCardPriceFormField } from '@/components/GiftCardPriceFormField'

type GiftCardAmountSectionProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  currency?: string
  error?: string
  quickAmounts?: number[]
  onQuickAmount?: (value: number) => void
  className?: string
}

export function GiftCardAmountSection<T extends FieldValues>({
  control,
  name,
  currency = 'GHS',
  error,
  quickAmounts,
  onQuickAmount,
  className,
}: GiftCardAmountSectionProps<T>) {
  return (
    <section className={`border-b border-gray-100 px-4 py-6 sm:px-6 sm:py-8 md:px-10 ${className ?? ''}`}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-[#212529]">Gift Card Amount</h3>
          <p className="text-sm text-gray-500">
            Set an amount up to {currency} 10,000 per recipient
          </p>
        </div>
        <div className="max-w-md space-y-4">
        <GiftCardPriceFormField
          control={control}
          name={name}
          label="Enter Amount"
          error={error}
          showRangeHint={false}
          placeholder="0.00"
          iconBefore={<span className="font-semibold text-primary-500">{currency}</span>}
          innerClassName="gap-2 rounded-lg border-gray-200 px-4 py-3"
          inputClassName="text-left text-lg font-semibold text-[#212529] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {quickAmounts && quickAmounts.length > 0 && onQuickAmount ? (
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => onQuickAmount(value)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-500 hover:bg-primary-500 hover:text-white"
              >
                {currency} {value}
              </button>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Icon icon="bi:info-circle" className="size-4" />
          Amount limit: {currency} 10,000 per recipient
        </div>
        </div>
      </div>
    </section>
  )
}
