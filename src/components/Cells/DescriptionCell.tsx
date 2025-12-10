import { sentenceCase } from '@/utils/helpers'

export function DescriptionCell({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div className="normal-case">{sentenceCase(getValue()) || '-'}</div>
}
