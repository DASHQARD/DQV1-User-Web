import { cn, Icon } from '@/libs'

import { Text } from './Text'

type Props = Readonly<{
  error?: string | { message: string } | boolean
  className?: string
}>

export function ErrorText({ error, className }: Props) {
  return error && typeof error !== 'boolean' ? (
    <div className="mt-2 flex items-center gap-1">
      <Icon icon="hugeicons:information-circle" className="text-xl text-[#F0142F]" />
      <Text variant="span" className={cn('text-[#F0142F]', className)}>
        {typeof error === 'string' ? error : error?.message}
      </Text>
    </div>
  ) : null
}
