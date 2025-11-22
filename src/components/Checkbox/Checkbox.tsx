import React from 'react'

import { cn } from '@/libs'

import classes from './checkbox.module.scss'

interface Props {
  variant?: 'lg' | 'sm'
  label?: string
  disabled?: boolean
  indeterminate?: boolean
  rounded?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'> & Props>(
  ({ label, disabled, indeterminate, variant = 'lg', rounded = false, ...rest }, ref) => {
    const getSizePx = (size: 'lg' | 'sm') => {
      if (size === 'lg') return '24px'
      if (size === 'sm') return '16px'
      return '16px'
    }

    return (
      <div
        className={cn([classes.checkbox])}
        style={{ '--size': getSizePx(variant) } as React.CSSProperties}
      >
        <label className={cn([classes.label])}>
          <input
            ref={ref}
            type="checkbox"
            disabled={disabled}
            className={cn(
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
              [classes.checkbox_input],
              { [classes.disabled]: disabled },
              { [classes.indeterminate]: indeterminate },
              { [classes.rounded]: rounded },
            )}
            {...rest}
          />
          {label ? <span className="">{label}</span> : null}
        </label>
      </div>
    )
  },
)

export default Checkbox
