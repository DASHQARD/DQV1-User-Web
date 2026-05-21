import { type TableCellProps } from '@/types'
import { formatCurrency } from '@/utils/format'

export function CurrencyCell({ row }: TableCellProps) {
  const original = row.original as Record<string, unknown>
  const amount = original.amount as number | string | undefined
  const currency = original.currency as string | undefined
  return <span>{formatCurrency(amount ?? 0, currency || 'GHS')}</span>
}
