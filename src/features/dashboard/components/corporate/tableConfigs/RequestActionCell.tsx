import { Dropdown } from '@/components'
import { usePersistedModalState, useToast } from '@/hooks'
import { Icon } from '@/libs'
import { MODALS } from '@/utils/constants'
import { corporateMutations } from '@/features/dashboard/corporate/hooks/useCorporateMutations'

export function RequestActionCell({ row }: any) {
  const modal = usePersistedModalState({
    paramName: MODALS.REQUEST.PARAM_NAME,
  })
  const { useDeleteCorporateRequestService } = corporateMutations()
  const { mutateAsync: deleteRequest, isPending: isDeleting } = useDeleteCorporateRequestService()
  const { error, success } = useToast()
  const isPending = row.original.status === 'pending'

  const handleDelete = async () => {
    const requestId = row.original.id || row.original.request_id
    if (!requestId) {
      error('Request ID is required')
      return
    }

    if (
      window.confirm('Are you sure you want to delete this request? This action cannot be undone.')
    ) {
      try {
        await deleteRequest(requestId)
        success('Request deleted successfully')
      } catch (err: any) {
        error(err?.message || 'Failed to delete request. Please try again.')
      }
    }
  }

  const actions = [
    {
      label: 'View Details',
      onClickFn: () => {
        modal.openModal(MODALS.REQUEST.CHILDREN.VIEW, { ...row.original })
      },
    },
    ...(isPending
      ? [
          {
            label: 'Approve',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.APPROVE, { ...row.original })
            },
          },
          {
            label: 'Reject',
            onClickFn: () => {
              modal.openModal(MODALS.REQUEST.CHILDREN.REJECT, { ...row.original })
            },
          },
        ]
      : []),
    {
      label: 'Delete',
      onClickFn: handleDelete,
      disabled: isDeleting,
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
