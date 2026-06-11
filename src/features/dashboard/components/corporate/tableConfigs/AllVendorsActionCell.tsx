import { Dropdown } from '@/components'
import { Icon } from '@/libs'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function AllVendorsActionCell({ row }: { row: { original: Record<string, unknown> } }) {
  const vendor = row.original
  const { useDeleteVendorManagementService } = corporateMutations()
  const { mutateAsync: deleteVendor, isPending: isDeleting } = useDeleteVendorManagementService()

  const vendorId = vendor?.id ?? vendor?.vendor_id ?? vendor?.vendor_account_id

  const handleDelete = async () => {
    if (vendorId == null) return
    try {
      await deleteVendor(vendorId as string | number)
    } catch {
      // Toast handled by mutation
    }
  }

  const actions = [{ label: 'Delete', onClickFn: handleDelete, className: 'text-red-600' }]

  return (
    <Dropdown actions={actions} disabled={isDeleting}>
      <button
        type="button"
        className="p-1.5 rounded hover:bg-gray-100"
        aria-label="Actions"
        disabled={isDeleting}
      >
        <Icon icon="bi:three-dots-vertical" className="w-5 h-5 text-gray-600" />
      </button>
    </Dropdown>
  )
}
