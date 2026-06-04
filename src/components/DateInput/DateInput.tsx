import { useCallback, useState } from 'react'
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
    onChange: onChangeProp,
    ...rest
  } = props

  const [isOpen, setIsOpen] = useState(false)

  const closeCalendar = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleChange = useCallback(
    (date: Date | null) => {
      onChangeProp?.(date)
      if (date != null) {
        setIsOpen(false)
      }
    },
    [onChangeProp],
  )

  return (
    <div>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <DatePicker
        {...rest}
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
          disabled && 'cursor-not-allowed bg-[#f3f3f4] text-gray-400 placeholder:text-gray-400',
          error && 'border-red-500 ring-1 ring-red-500',
        )}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        open={isOpen}
        shouldCloseOnSelect
        onInputClick={() => {
          if (!disabled) setIsOpen(true)
        }}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={closeCalendar}
        onClickOutside={closeCalendar}
        onSelect={closeCalendar}
        onChange={handleChange}
      />
      <ErrorText error={error} />
    </div>
  )
}
