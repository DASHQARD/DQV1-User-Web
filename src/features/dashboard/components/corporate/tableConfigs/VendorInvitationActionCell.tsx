import { Dropdown } from '@/components'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function VendorInvitationActionCell({
  row,
}: {
  row: { original: Record<string, unknown> }
}) {
  const invitation = row.original
  const { useCancelVendorInvitationService } = corporateMutations()
  const { mutateAsync: cancelInvitation, isPending } = useCancelVendorInvitationService()

  const invitationId = invitation?.id ?? invitation?.invitation_id
  const status = String(invitation?.status ?? '').toLowerCase()
  const canCancel = status === 'pending'

  const handleCancel = async () => {
    if (!invitationId || !canCancel) return
    try {
      await cancelInvitation({ invitation_id: Number(invitationId) })
    } catch {
      // Toast handled by mutation
    }
  }

  const actions = []
  if (canCancel) {
    actions.push({ label: 'Cancel invitation', onClickFn: handleCancel })
  }
  if (!canCancel) {
    actions.push({
      label: 'No actions available',
      onClickFn: () => {},
      className: 'text-gray-500 cursor-not-allowed',
    })
  }

  return (
    <Dropdown actions={actions} disabled={isPending}>
      <button
        type="button"
        className="p-1.5 rounded hover:bg-gray-100"
        aria-label="Actions"
        disabled={isPending}
      >
        <Icon icon="bi:three-dots-vertical" className="w-5 h-5 text-gray-600" />
      </button>
    </Dropdown>
  )
}
