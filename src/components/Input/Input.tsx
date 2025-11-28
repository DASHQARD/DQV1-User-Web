import React from 'react'

import { cn, Icon } from '@/libs'

import { InputLabel } from '../InputLabel'
import { ErrorText } from '../Text'
import classes from './Input.module.scss'

type Props = Readonly<{
  [other: string]: unknown

  error?: string | boolean
  className?: string
  label?: string
  labelChild?: React.ReactNode
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'textarea'
  name?: string
  id?: string

  prefix?: React.ReactNode
  suffix?: React.ReactNode
  iconBefore?: React.ReactNode

  innerClassName?: string
  inputClassName?: string
}> &
  React.HTMLAttributes<HTMLInputElement> &
  React.HTMLAttributes<HTMLTextAreaElement>

export const Input = React.forwardRef(
  (props: Props, ref: React.Ref<HTMLInputElement & HTMLTextAreaElement>) => {
    const {
      label,
      labelChild,
      type = 'text',
      error = '',
      className,
      inputClassName,
      innerClassName,
      prefix,
      suffix,
      id,
      ...otherProps
    } = props

    delete otherProps.defaultValue

    const wrapperRef = React.useRef<HTMLDivElement | null>(null)
    const isTextarea = type === 'textarea'
    const isPassword = type === 'password'

    const [show, setShow] = React.useState(false)

    const computedTestId = `input-${label}`

    const computedType = React.useMemo(() => {
      switch (type) {
        case 'password':
          return show ? 'text' : 'password'
        case 'date':
          return 'date'
        default:
          return type
      }
    }, [type, show])

    const computedInputClassName = cn(
      'w-full border-none min-w-[0px] !outline-0 !bg-[transparent] self-stretch outline-none text-grey-600',
      'placeholder:text-gray-300 disabled:cursor-not-allowed',
      inputClassName,
      classes.input,
    )

    function focusOnInput() {
      const input = wrapperRef.current?.querySelector('input')
      if (!input) return
      input.focus()
    }

    function handleWrapperClick(e: React.MouseEvent<HTMLDivElement>) {
      e.stopPropagation()
      focusOnInput()
    }

    function handleLabelClick(e: React.MouseEvent<HTMLLabelElement>) {
      e.stopPropagation()
      focusOnInput()
    }

    function handleToggleShow() {
      setShow((prev) => !prev)
      focusOnInput()
    }

    return (
      /* WRAPPER */
      <div aria-hidden ref={wrapperRef} className={cn('', className)} onClick={handleWrapperClick}>
        {/* LABEL */}
        {label ? (
          <InputLabel
            htmlFor={props?.id ?? props.name}
            onClick={handleLabelClick}
            className="flex gap-1 items-center text-[#151819] text-sm"
          >
            {label} {labelChild}
          </InputLabel>
        ) : null}

        {/* INNER */}
        <div
          className={cn(
            'flex gap-4 border border-gray-300 rounded-lg h-12 items-center px-3 relative',
            'focus-within:border-primary-400',
            { 'border-red-500': !!error },
            { 'min-h-12': !isTextarea },
            { 'text-gray-400 bg-[#f3f3f4]': otherProps.disabled },
            innerClassName,
          )}
        >
          {prefix}

          {props.iconBefore && <InputPrefixIconWrapper>{props.iconBefore}</InputPrefixIconWrapper>}

          {/* TEXT FIELD */}
          {!isTextarea ? (
            <input
              data-testid={computedTestId}
              aria-hidden
              type={computedType}
              ref={ref}
              className={computedInputClassName}
              id={id ?? otherProps.name}
              {...otherProps}
            />
          ) : null}

          {/* TEXTAREA */}
          {isTextarea ? (
            <textarea
              data-testid={computedTestId}
              aria-hidden
              className={computedInputClassName}
              ref={ref}
              id={id ?? otherProps.name}
              {...otherProps}
            ></textarea>
          ) : null}

          {suffix}
          {isPassword ? (
            <button
              type="button"
              className="grid place-content-center w-6 h-6 text-base text-gray-500"
              onClick={handleToggleShow}
            >
              {!show ? <Icon icon="hugeicons:view" className="text-gray-400" /> : null}
              {show ? <Icon icon="hugeicons:view-off-slash" className="text-gray-400" /> : null}
            </button>
          ) : null}
        </div>

        {/* MESSAGE */}
        <ErrorText error={error} />
      </div>
    )
  },
)

export function InputPrefixIconWrapper({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <span className="inline-block pr-2 mr-2 border-r border-gray-200 text-gray-300">
      {children}
    </span>
  )
}
