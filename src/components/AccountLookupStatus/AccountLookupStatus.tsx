import { Loader, Text } from '@/components'

type Props = {
  isResolving: boolean
  accountName: string | null
  error: string | null
  resolvingLabel?: string
  successPrefix?: string
}

export function AccountLookupStatus({
  isResolving,
  accountName,
  error,
  resolvingLabel = 'Verifying account…',
  successPrefix = 'Account name',
}: Props) {
  if (isResolving) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Loader className="h-4 w-4" />
        <span>{resolvingLabel}</span>
      </div>
    )
  }

  if (error) {
    return (
      <Text variant="p" className="text-sm text-red-600">
        {error}
      </Text>
    )
  }

  if (accountName) {
    return (
      <Text variant="p" className="text-sm text-emerald-700">
        {successPrefix}: <span className="font-semibold">{accountName}</span>
      </Text>
    )
  }

  return null
}
