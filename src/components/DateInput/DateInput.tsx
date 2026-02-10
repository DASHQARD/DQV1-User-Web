import DatePicker, { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { cn } from '@/libs'

import './DateInput.scss'

import { InputLabel } from '../InputLabel'
import { ErrorText } from '../Text'

type Props = Readonly<
  {
    placeholder?: string
    value?: Date
    label?: string
    id?: string
    error?: string
    disabled?: boolean
    dateFormat?: string
    maxDate?: Date
    minDate?: Date
    strictParsing?: boolean
    onChange?: (date: Date | null) => void
  } & Partial<ReactDatePickerCustomHeaderProps>
>
export function DateInput(props: Props) {
  const {
    placeholder,
    value,
    label = 'Date Created',
    id = 'calendar-id',
    error,
    disabled,
    dateFormat = 'dd, MMM yyyy',
    maxDate,
    minDate,
    strictParsing,
    ...rest
  } = props
  return (
    <div>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <DatePicker
        disabled={disabled}
        selected={value}
        placeholderText={placeholder}
        dateFormat={dateFormat}
        id={id}
        maxDate={maxDate}
        minDate={minDate}
        strictParsing={strictParsing}
        className={cn(
          'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-600 placeholder:text-gray-300 focus:border-primary-400 focus:outline-none',
          error && 'border-red-500 ring-1 ring-red-500',
        )}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        {...rest}
      />
      <ErrorText error={error} />
    </div>
  )
}
