import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Input } from '@/components'
import {
  fromGiftCardPriceInputChange,
  GIFT_CARD_AMOUNT_MAX,
  GIFT_CARD_AMOUNT_MIN,
  giftCardAmountRangeHint,
  toGiftCardPriceInputValue,
} from '@/utils/giftCardAmount'

type GiftCardPriceFormFieldProps<T extends FieldValues> = {
  control: Control<T>
  name: FieldPath<T>
  label?: string
  error?: string
  disabled?: boolean
  placeholder?: string
  showRangeHint?: boolean
  iconBefore?: React.ReactNode
  className?: string
  innerClassName?: string
  inputClassName?: string
}

export function GiftCardPriceFormField<T extends FieldValues>({
  control,
  name,
  label = 'Price',
  error,
  disabled,
  placeholder = '0.00',
  showRangeHint = true,
  iconBefore,
  className,
  innerClassName,
  inputClassName,
}: GiftCardPriceFormFieldProps<T>) {
  return (
    <div className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            label={label}
            type="number"
            step="0.01"
            min={GIFT_CARD_AMOUNT_MIN}
            max={GIFT_CARD_AMOUNT_MAX}
            placeholder={placeholder}
            disabled={disabled}
            iconBefore={iconBefore}
            innerClassName={innerClassName}
            inputClassName={inputClassName}
            value={toGiftCardPriceInputValue(field.value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              field.onChange(fromGiftCardPriceInputChange(e.target.value))
            }
            onBlur={field.onBlur}
            name={field.name}
            error={error}
          />
        )}
      />
      {showRangeHint && (
        <p className="mt-1 text-xs text-gray-500">
          Allowed range: {giftCardAmountRangeHint('GHS')}
        </p>
      )}
    </div>
  )
}
