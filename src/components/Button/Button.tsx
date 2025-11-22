import React from 'react'
import { type VariantProps } from 'class-variance-authority'
import type { IconProps } from '@iconify/react'
import { Icon } from '@/libs'
import { buttonClasses } from './buttonClasses'

type ButtonClasses = VariantProps<typeof buttonClasses>

type AsProp = React.ElementType | React.ComponentType<unknown>

type ButtonProps<T extends AsProp = 'button'> = {
  as?: T
  icon?: IconProps['icon']
  iconPosition?: 'left' | 'right'
  iconProps?: Partial<React.ComponentProps<typeof Icon>>
  loading?: boolean
  className?: string
} & React.ComponentProps<'button'> &
  Omit<ButtonClasses, 'minW'>

export function Button<T extends AsProp = 'button'>(props: ButtonProps<T>) {
  const {
    as = 'button',
    iconProps = {},
    iconPosition,
    disabled,
    iconOnly,
    icon,
    loading = false,
    children,
    variant,
    className,
    size,
    ...rest
  } = props

  const evaluatedProps = {
    className: buttonClasses({
      variant,
      size,
      disabled: disabled || loading,
      iconOnly,
      className,
      minW: !className || !className.includes('h-'),
    }),
    disabled: disabled || loading,
    ...rest,
  }

  const renderedIcon = icon ? <Icon {...iconProps} icon={icon} /> : null

  return React.createElement(
    as,
    evaluatedProps as React.ComponentProps<'button'>,
    iconPosition === 'left' && !loading && icon ? renderedIcon : null,
    iconOnly && icon && !loading ? renderedIcon : null,
    loading ? <Icon icon="mdi:loading" className="animate-spin text-xl" /> : null,
    !loading ? children : null,
    iconPosition === 'right' && !loading && icon ? renderedIcon : null,
  )
}
