import { formatDate, formatFullDate } from '@/utils/format'

export function DateCell({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? formatDate(getValue()) : '-'}</div>
}
export function DateCellTimestamp({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? formatFullDate(getValue()) : '-'}</div>
}
