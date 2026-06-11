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
  return (
    <div className={cn('flex flex-col gap-1 p-1 rounded-lg bg-[#F4F5F7] sm:flex-row', className)}>
      {tabs.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => setActive(item.value)}
          className={cn(
            'w-full sm:flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors text-center',
            active === item.value
              ? 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              : 'text-gray-600 hover:text-gray-700 bg-transparent border border-transparent',
            btnClass,
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
