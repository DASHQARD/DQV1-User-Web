import { Input } from '@/components'
import {
  giftCardAmountRangeHint,
  getGiftCardAmountValidationMessage,
  normalizeGiftCardAmountInput,
} from '@/utils/giftCardAmount'

type GiftCardAmountFieldProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
  className?: string
  inputClassName?: string
}

export function GiftCardAmountField({
  value,
  onChange,
  label = 'Enter Amount',
  id = 'gift-card-amount',
  className,
  inputClassName = 'w-full rounded-lg border border-gray-200 px-4 py-3 pl-16 text-lg font-semibold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
}: GiftCardAmountFieldProps) {
  const validationMessage = getGiftCardAmountValidationMessage(value)

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-primary-500">
          GHS
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange(normalizeGiftCardAmountInput(e.target.value))
          }
          placeholder="0.00"
          maxLength={9}
          className={inputClassName}
          error={validationMessage ?? undefined}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">Allowed range: {giftCardAmountRangeHint()}</p>
    </div>
  )
}
