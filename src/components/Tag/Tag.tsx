import { cn } from '@/libs'

type Props = Readonly<{
  value: string
  variant?: 'error' | 'warning' | 'success' | 'gray'
  className?: string
}>
export function Tag({ value, variant, className }: Props) {
  const type = variant ?? 'gray'
  const colorVariants: Record<typeof type, string[]> = {
    success: ['bg-success-100', 'bg-success', 'text-success-800'],
    warning: ['bg-warning-100', 'bg-warning', 'text-warning'],
    error: ['bg-error-100', 'bg-error', 'text-error-800'],
    gray: ['bg-gray-100', 'bg-gray', 'text-gray'],
  }
  return (
    <div
      className={cn(
        'rounded-sm flex gap-1 w-fit items-center py-1.5 px-2 text-[11px] capitalize h-max font-semibold',
        colorVariants[type][0],
        colorVariants[type][2],
        className,
      )}
    >
      <span>{value}</span>
    </div>
  )
}
