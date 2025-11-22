import React from 'react'

import { cn } from '@/libs/clsx'

import { Text } from '../Text'

type Props = {
  children: React.ReactNode
  className?: string
  htmlFor?: string
} & React.HTMLAttributes<HTMLLabelElement>

export function InputLabel({ children, className, htmlFor, ...props }: Props) {
  return (
    <Text
      as="label"
      className={cn('inline-block mb-1.5 leading-[120%] text-gray-600', className)}
      htmlFor={htmlFor}
      aria-hidden
      {...props}
    >
      {children}
    </Text>
  )
}
