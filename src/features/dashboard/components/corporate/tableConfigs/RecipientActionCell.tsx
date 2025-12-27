import { Dropdown } from '@/components'
import { Icon } from '@/libs'
import type { TableCellProps } from '@/types'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'
import { useToast } from '@/hooks'

export function RecipientActionCell({ row }: TableCellProps<any>) {
  const { useDeleteRecipientService } = corporateMutations()
  const { mutateAsync: deleteRecipient, isPending } = useDeleteRecipientService()
  const toast = useToast()

  const handleDelete = async () => {
    const recipientId = row.original.id
    if (!recipientId) {
      toast.error('Recipient ID is missing')
      return
    }

    try {
      await deleteRecipient(recipientId)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete recipient. Please try again.')
      // Error is handled by the mutation hook
    }
  }

  const actions = [
    {
      label: 'Delete',
      onClickFn: handleDelete,
      disabled: isPending,
    },
  ]

  return (
    <Dropdown actions={actions}>
      <button type="button" className="btn rounded-lg no-print" aria-label="View actions">
        <Icon icon="hugeicons:more-vertical" width={24} height={24} />
      </button>
    </Dropdown>
  )
}
