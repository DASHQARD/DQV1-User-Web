import { formatDate, formatDateTime, formatFullDate } from '@/utils/format'

export function DateCell({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? formatDate(getValue()) : '-'}</div>
}

export function DateTimeCell({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? formatDateTime(getValue()) : '-'}</div>
}

export function DateCellTimestamp({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? formatFullDate(getValue()) : '-'}</div>
}
