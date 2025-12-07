import type { ComponentProps } from 'react'

import { Input } from '@/components'
import { Icon } from '@/libs'

export default function SearchBox({
  value,
  onChange,
  ref,
  placeholder = 'Search',
  ...props
}: ComponentProps<typeof Input> & {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ref?: React.RefObject<HTMLInputElement & HTMLTextAreaElement>
  placeholder?: string
}) {
  return (
    <Input
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      prefix={<Icon icon="hugeicons:search-01" width="18" className="mr-2" />}
      innerClassName="border-gray-200 bg-white"
      inputClassName="text-sm"
      {...props}
    />
  )
}
