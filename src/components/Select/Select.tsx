import React from 'react'

import {
  Content,
  Item,
  ItemIndicator,
  ItemText,
  Portal,
  Root,
  ScrollDownButton,
  ScrollUpButton,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select'

import { CustomIcon, ErrorText, InputLabel, Loader } from '@/components'
import { useHookFormInputRef } from '@/hooks'
import { cn } from '@/libs'
import type { DropdownOption, NativeEventHandler } from '@/types'
import { isTesting } from '@/utils/constants'

type DefaultValueProps = Readonly<{
  currentOption?: DropdownOption
  placeholder?: string
  value?: string
}>

type Props = Readonly<{
  name?: string
  label?: string
  error?: string | boolean
  className?: string
  innerClassName?: string
  options: DropdownOption[]
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  loading?: boolean

  open?: boolean
  value?: string
  onChange?: NativeEventHandler
  onValueChange?: (value: string) => void
  onBlur?: NativeEventHandler

  renderValue?: (props: DefaultValueProps) => React.ReactNode
}>

export const Select = React.memo(
  React.forwardRef((props: Props, ref) => {
    const {
      name = '',
      error,
      label,
      placeholder,
      options = [],
      disabled,
      value = '',
      className,
      innerClassName,
      onChange,
      onBlur,
      renderValue = DefaultValue,
      loading,
    } = props

    const { onValueChange, onElementBlur } = useHookFormInputRef({
      name,
      value,
      onChange: onChange as (e: Event) => void,
      onBlur: onBlur as (e: Event) => void,
      ref: ref as React.Ref<HTMLInputElement>,
    })

    const currentOption = options.find((option) => option.value === value)

    return (
      /* WRAPPER */
      <div className={cn('', className)}>
        {/* LABEL */}
        {label ? <InputLabel htmlFor={props.name}>{label}</InputLabel> : null}

        {/* INNER */}
        <Root value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
          <Trigger
            data-testid={`select-${label ?? ''}`}
            data-value={value}
            className={cn(
              'bg-white text-[13px] flex justify-between w-full outline-none ring-1 ring-gray-200 items-center py-2.5 px-4 rounded-lg h-12 disabled:cursor-not-allowed',
              ' focus:ring-primary-500',
              { 'ring-1 ring-error-500': !!error },
              { 'text-[#9DA1A8]': !!placeholder && !value },
              innerClassName,
            )}
            onBlur={onElementBlur}
          >
            <Value placeholder={placeholder}>
              {renderValue({ value, currentOption, placeholder })}
            </Value>
            <div>
              {!loading && <CustomIcon name="Caret" className="text-[#9DA1A8]" />}
              {loading && <Loader />}
            </div>
          </Trigger>

          <Portal>
            <Content className="w-full bg-white p-1.5 rounded-md shadow z-5000 menu-shadow">
              <ScrollUpButton className="flex justify-center bg-primary-500/10 text-xl">
                <CustomIcon name="ArrowDown" className="rotate-180" />
              </ScrollUpButton>
              <Viewport>
                {options.map((option) => (
                  <Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'flex gap-4 justify-between p-2 px-3 hover:bg-primary-50/50 cursor-pointer rounded data-[highlighted]:bg-gray-100 m-1 outline-none focus:ring-1 focus:ring-gray-200',
                      { 'bg-primary-500/10': option.value === value },
                    )}
                  >
                    <ItemText>{option.label}</ItemText>
                    <ItemIndicator>
                      <span className="inline-block rounded w-2 h-2 bg-primary-500"></span>
                    </ItemIndicator>
                  </Item>
                ))}
              </Viewport>
              <ScrollDownButton className="flex justify-center bg-primary-500/10 text-xl">
                <CustomIcon name="ArrowDown" />
              </ScrollDownButton>
            </Content>
          </Portal>
        </Root>

        {isTesting /* FOR TESTING */ ? (
          <ul>
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => onValueChange(option.value)}
                  data-testid={`option-${option.value}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {/* MESSAGE */}
        <ErrorText error={error} />
      </div>
    )
  }),
)

function DefaultValue({ value, currentOption, placeholder }: DefaultValueProps) {
  return value ? currentOption?.label : placeholder
}
