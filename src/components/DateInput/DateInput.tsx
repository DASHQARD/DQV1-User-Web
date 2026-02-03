import DatePicker, { type ReactDatePickerCustomHeaderProps } from 'react-datepicker'

import { cn } from '@/libs'

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
        className={cn(error && 'outline-none ring-1 ring-error')}
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
