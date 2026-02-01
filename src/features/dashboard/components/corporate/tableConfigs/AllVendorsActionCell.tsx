import { Dropdown } from '@/components'
import { Icon } from '@/libs'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { corporateMutations } from '@/features/dashboard/corporate/hooks'

export function AllVendorsActionCell({ row }: { row: { original: Record<string, unknown> } }) {
  const vendor = row.original
  const navigate = useNavigate()
  const { useDeleteVendorManagementService, useUpdateVendorStatusManagementService } =
    corporateMutations()
  const { mutateAsync: deleteVendor, isPending: isDeleting } = useDeleteVendorManagementService()
  const { mutateAsync: updateStatus, isPending: isUpdating } =
    useUpdateVendorStatusManagementService()

  const vendorId = vendor?.id ?? vendor?.vendor_id ?? vendor?.vendor_account_id
  const status = String(vendor?.status ?? '').toLowerCase()
  const isPending = isDeleting || isUpdating

  const handleView = () => {
    if (vendorId) {
      navigate(`${ROUTES.IN_APP.DASHBOARD.VENDOR.HOME}?account=vendor&vendor_id=${vendorId}`)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!vendorId) return
    try {
      await updateStatus({ vendor_account_id: Number(vendorId), status: newStatus })
    } catch {
      // Toast handled by mutation
    }
  }

  const handleDelete = async () => {
    if (vendorId == null) return
    try {
      await deleteVendor(vendorId as string | number)
    } catch {
      // Toast handled by mutation
    }
  }

  const actions = [
    { label: 'View', onClickFn: handleView },
    ...(status !== 'active'
      ? [{ label: 'Set Active', onClickFn: () => handleStatusChange('active') }]
      : []),
    ...(status !== 'inactive'
      ? [{ label: 'Set Inactive', onClickFn: () => handleStatusChange('inactive') }]
      : []),
    ...(status !== 'suspended'
      ? [{ label: 'Suspend', onClickFn: () => handleStatusChange('suspended') }]
      : []),
    { label: 'Delete', onClickFn: handleDelete, className: 'text-red-600' },
  ]

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
