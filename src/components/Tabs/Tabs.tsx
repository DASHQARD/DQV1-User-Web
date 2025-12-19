import React from 'react'

import { motion } from 'framer-motion'

import { cn } from '@/libs'
import type { DropdownOption } from '@/types'

type Props = Readonly<{
  tabs: DropdownOption[]
  active: string
  setActive: (value: string) => void
  className?: string
  btnClass?: string
}>
export function Tabs({ tabs, active, setActive, className, btnClass }: Props) {
  const id = React.useId()

  return (
    <div className={cn('flex gap-2 border-b border-transparent text-gray-400', className)}>
      {tabs.map((item) => (
        <button
          key={item.value}
          onClick={() => setActive(item.value)}
          className={cn(
            'relative hover:opacity-85',
            {
              'text-primary-700 text-base': active === item.value,
            },
            btnClass,
          )}
        >
          {active === item.value && (
            <motion.span
              layoutId={id}
              transition={{ type: 'spring', duration: 0.6 }}
              className="absolute inset-0 border-b-2 border-primary-700"
            />
          )}
          {item.label}
        </button>
      ))}
    </div>
  )
}
