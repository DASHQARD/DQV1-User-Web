export function GeneralCell({ getValue }: Readonly<{ getValue: () => string }>) {
  return <div>{getValue() ? getValue().split('_').join(' ') : '-'}</div>
}
