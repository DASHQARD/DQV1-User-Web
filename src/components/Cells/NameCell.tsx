import { Avatar } from '@/components'
import { type TableCellProps } from '@/types'

export function NameCell({ row }: TableCellProps) {
  const { first_name, last_name, full_name } = row.original
  return (
    <div className="flex items-center gap-2">
      <Avatar
        className="text-xs flex justify-center items-center"
        size="xs"
        name={full_name || `${first_name} ${last_name}`}
        fallback={full_name ?? `${first_name} ${last_name}`}
      />
      {full_name ?? `${first_name} ${last_name}`}
    </div>
  )
}
