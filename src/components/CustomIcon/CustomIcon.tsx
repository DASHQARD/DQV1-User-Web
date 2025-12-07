import React from 'react'

import { cn } from '@/libs/clsx'
import type { IconNames } from '@/types'
import { toKebabCase } from '@/utils/helpers'

type Props = React.ComponentProps<'svg'> & Readonly<{ className?: string; name: IconNames }>
type IconModules = Record<string, { default: React.FC }>

const modules = import.meta.glob('../../assets/icons/*.svg', {
  eager: true,
}) as IconModules

export function CustomIcon({ className, name, ...otherProps }: Props) {
  const Icon = React.useMemo(
    () => modules[`../../assets/icons/${toKebabCase(name)}.svg`]?.default,
    [name],
  )

  return (
    <span className={cn(className)} data-testid={`icon-${name}`}>
      {Icon ? <Icon {...otherProps} /> : null}
    </span>
  )
}
