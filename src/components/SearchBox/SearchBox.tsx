import { type ComponentProps } from 'react'

import { Input } from '@/components'
import { Icon } from '@/libs'

export const SearchBox = ({
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
}) => {
  return (
    <Input
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      prefix={
        <span className="text-gray-500">
          <Icon icon="hugeicons:search-01" width="18" className="mr-2" />
        </span>
      }
      innerClassName="border-gray-200 bg-white"
      inputClassName="text-sm"
      {...props}
    />
  )
}
