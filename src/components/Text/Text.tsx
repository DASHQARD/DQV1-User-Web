import React from 'react'

import { cn } from '@/libs'

type PossibleTextElements = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label'
type Props = {
  children: React.ReactNode
  as?: PossibleTextElements
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  asVariant?: boolean
  className?: string
} & React.ComponentProps<PossibleTextElements>

export const Text = React.memo((props: Props) => {
  const {
    as = 'div',
    variant = 'p',
    weight,
    asVariant = false,
    className = '',
    children,
    ...rest
  } = props

  const computedFontWeight = React.useMemo(() => {
    if (!weight)
      return variant.includes('h') // if it's a heading text
        ? 'bold'
        : 'normal'
    return weight
  }, [weight, variant])

  const fontWeights: Record<Exclude<Props['weight'], undefined>, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
    black: 'font-black',
  }

  const variantClasses: Record<Exclude<Props['variant'], undefined>, string> = {
    h1: 'text-[32px] leading-[38px]',
    h2: 'text-[24px] leading-[120%]',
    h3: 'text-[20px] leading-[28px]',
    h4: 'text-lg',
    h5: 'text-base',
    h6: 'text-base',
    p: 'text-base leading-[1.4] tracking-[-0.01em]1',
    span: 'text-sm',
  }

  const classNames = cn([
    { [variantClasses[variant]]: !!variant },
    { [fontWeights[computedFontWeight]]: !!computedFontWeight },
    className,
  ])

  const evaluatedElement = asVariant ? variant : as

  return React.createElement(evaluatedElement, { className: classNames, ...rest }, children)
})
