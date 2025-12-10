import { Tag } from '@/components'
import { type TableCellProps } from '@/types'
import { getStatusVariant } from '@/utils/helpers'

export function StatusCell({ row }: TableCellProps<{ status: string }>) {
  const { status } = row.original

  return <>{status ? <Tag value={status} variant={getStatusVariant(status)} /> : '-'}</>
}
