import { type TableCellProps } from '@/types'

export function EmailCell({ row }: TableCellProps) {
  const { email, user_email } = row.original
  return <span className="lowercase">{email || user_email || '-'}</span>
}
